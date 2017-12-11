require('./sccpClient').runSCCP('post("hello frank")', process.argv[2], 'admin');

process.stdout.write(`excuted path: ${process.argv[2]}`);
