require('./sccpClient').runSCCP('enter @ "clock" do ( say("tick") )', process.argv[2], 'admin', 0);

process.stdout.write(`excuted path: ${process.argv[2]}`);
