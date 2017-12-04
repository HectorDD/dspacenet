require('./sccpClient').runSCCP('enter @ "clock" do ( say("tick") )', process.argv[2], 'admin')
console.log('excuted path:', process.argv[2]);