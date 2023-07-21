"use strict";

/*
 * 
 * This is the Javascript portion of visualizing Android Code Coverage within a native executable. 
 * Originally this code was written by @gaasedelen for lighthouse, and has since been modified
 * by @datalocaltmp.
 * 
 * Note that this Javascript requires you set the name of the native library you want to trace
 * as well as the exported function.
 * 
 */
var whitelist = ["libosutils.so"];
var exportName = "_ZN3OVR2OS7Process14getProcessNameEib";

// This function takes a list of GumCompileEvents and converts it into a DRcov
//  entry. Note that we'll get duplicated events when two traced threads
//  execute the same code, but this will be handled by the python side.
function drcov_bbs(bbs, fmaps, path_ids) {
    // We're going to use send(..., data) so we need an array buffer to send
    //  our results back with. Let's go ahead and alloc the max possible
    //  reply size

    /*
        // Data structure for the coverage info itself
        typedef struct _bb_entry_t {
            uint   start;      // offset of bb start from the image base
            ushort size;
            ushort mod_id;
        } bb_entry_t;
    */

    var entry_sz = 8;

    var bb = new ArrayBuffer(entry_sz * bbs.length);

    var num_entries = 0;

    for (var i = 0; i < bbs.length; ++i) {
        
        var e = bbs[i];

        var start = e[0];
        var end   = e[1];

        var path = fmaps.findPath(start);

        if (path == null) { continue; }

        var mod_info = path_ids[path];

        var offset = start.sub(mod_info.start).toInt32();
        var size = end.sub(start).toInt32();
        var mod_id = mod_info.id;

        // We're going to create two memory views into the array we alloc'd at
        // the start.

        // we want one u32 after all the other entries we've created
        var x =  new Uint32Array(bb, num_entries * entry_sz, 1);
        x[0] = offset;

        // we want two u16's offset after the 4 byte u32 above
        var y = new Uint16Array(bb, num_entries * entry_sz + 4, 2);
        y[0] = size;
        y[1] = mod_id;

        ++num_entries;
    }

    // We can save some space here, rather than sending the entire array back,
    //  we can create a new view into the already allocated memory, and just
    //  send back that linear chunk.
    return new Uint8Array(bb, 0, num_entries * entry_sz);
}

// Get the module map
function make_maps() {
    var maps = Process.enumerateModulesSync();
    var i = 0;
    // We need to add the module id
    maps.map(function(o) { o.id = i++; });
    // .. and the module end point
    maps.map(function(o) { o.end = o.base.add(o.size); });
    return maps;
}

/* This is the raw output file that will be captured on disk.
 * 
 * A keen eye will note that the rawcov.dat does not actually form valid JSON without
 * appending a ]} to the file; I apologize for my sins.
 * 
 */
var output_file = new File("/data/local/tmp/rawcov.dat", "wb");

Interceptor.attach(Module.getExportByName(null, exportName), {
    onEnter(args) {
        var maps = make_maps();
        var module_ids = {};
        output_file.write('{"map":'+JSON.stringify(maps)+',"bbs":[');

        maps.map(function (e) {
            module_ids[e.path] = {id: e.id, start: e.base};
        });

        var filtered_maps = new ModuleMap(function (m) {
            if (whitelist.indexOf('all') >= 0) { return true; }
        
            if(whitelist.indexOf(m.name)>=0){
                console.log('[!] Found '+m.name+', including for trace')
                return true;
            }else{
                Stalker.exclude({
                    "base": m.base,
                    "size": m.size
                });
                return false;
            }
        });

        Stalker.follow(Process.getCurrentThreadId(), {
            events: {
                call: false,
                ret: false,
                exec: false,
                block: true,
                compile: true
            },
            onReceive: function (event) {
                var bb_events = Stalker.parse(event, {stringify: false, annotate: false});
                var bbs = drcov_bbs(bb_events, filtered_maps, module_ids);
                output_file.write("["+bbs+"],");
            }
        });
    },
    onLeave(retval){
    }
});
