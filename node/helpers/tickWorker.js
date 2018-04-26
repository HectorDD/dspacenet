require('./sccpClient').runSCCP('enter @ "clock" do signal("tick")', process.argv[2], 'admin', 0);

process.stdout.write(`excuted path: ${process.argv[2]}`);
