/*jshint node:true, eqeqeq:true, undef:true, curly:true, laxbreak:true, forin:true, smarttabs:true */
/*global */



(function() {
    
    'use strict';
    
    

    var spawn = require('child_process').spawn,
        fs    = require('fs');



    var speak = function(text, o) {
        if (!('lang'   in o)) { o.lang   = 'en'; }
        if (!('format' in o)) { o.format = 'mp3'; }

        if (!('amplitude' in o)) { o.amplitude = 100; } else { o.amplitude = parseInt(o.amplitude, 10); }
        if (!('pitch'     in o)) { o.pitch     =  50; } else { o.pitch     = parseInt(o.pitch,     10); }
        if (!('speed'     in o)) { o.speed     = 175; } else { o.speed     = parseInt(o.speed,     10); }
        if (!('wordgap'   in o)) { o.wordgap   =   0; } else { o.wordgap   = parseInt(o.wordgap,   10); }

        var f;
        
        if ('filename' in o) {
            f = fs.createWriteStream(o.filename + '.' + o.format, {encoding:'binary'});
        }
        else if ('stream' in o) {
            f = o.stream;
        }
        else {
            throw 'either stream or filename must be passed in!';
        }

        var converter = (o.format === 'ogg') ? 'oggenc' : 'lame';

        text = text.replace(/\!/g, '\\!');
        text = text.replace(/'/g, '\\');
        

        var cmd = [
            'echo', '-e', ''+text+'',
            '|',
            'espeak',
            '--stdin',
            '--stdout',
            '-v', o.lang,
            '-a', o.amplitude,
            '-p', o.pitch,
            '-s', o.speed,
            '-l', o.wordgap,
            '|',
            converter,
            '--quiet',
            '-'
        ].join(' ');

        //console.log(cmd);

        var child = spawn('bash', ['-c', cmd], {cwd:__dirname});
        
        child.stdout.on('data', function(data) {
            f.write(data, 'binary');
        });
        
        child.stderr.on('data', function(data) {
            if (o.cb) {
                return o.cb(data);
            }
            else {
                throw data;
            }
        });
        
        child.on('exit', function(code) {
            f.end();
            if ('cb' in o) {
                if (code !== 0) {
                    return o.cb('Process returned error code=' + code);
                }
                o.cb(null);
            }
        });
        
    };

    module.exports = speak;

})();
