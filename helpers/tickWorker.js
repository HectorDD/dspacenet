require('./sccpClient').runSCCP('enter @ "clock" do ( say("tick") )', process.argv[2], 'admin',0)
console.log('excuted path:', process.argv[2]);