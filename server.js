let Koa = require('koa')
let server = new Koa()

let cors = require("koa2-cors")
server.use(cors())

let body = require("koa-body")
server.use(body())

let Router = require('koa-router')
let router = new Router()

let static1 = require("koa-static")
server.use(static1("./src"))

let { zhuTi , admin, font, music } = require('./mongo.js')

let multer = require("koa-multer") 

var fs = require("fs")

server.use(router.routes())
server.listen(3000, err => {
	console.log("服务器启动在3000端口")
})

//后台注册admin
router.post('/reg', async(ctx, next) => {
	let web = ctx.request.body
	let res = await admin.findOne({
		adminName: web.adminName
	})
	if(res) {
		console.log('账号已被占用！')
		ctx.body = '账号已被占用！'
	} else {
		let one = await new admin(web)
		one.save()
		console.log('恭喜您，注册成功！')
		ctx.body = '恭喜您，注册成功！'
	}
})

//后台登录admin
router.post('/login', async(ctx, next) => {
	let web = ctx.request.body
	let res = await admin.findOne({
		adminName: web.adminName
	})
	if(res) {
		if(res.pwd === web.pwd) {
			console.log(res.vip + '登录')
			ctx.body = res.vip
		} else {
			ctx.body = '抱歉，密码错误'
		}

	} else {
		console.log('您还未注册，请先注册哦！')
		ctx.body = '您还未注册，请先注册哦！'
	}
})

//后台获取admin
router.get('/admin', async(ctx, next) => {
	let total = await admin.countDocuments()
	let size = +ctx.query.size
	let current = +ctx.query.current
	let obj = JSON.parse(ctx.query.obj)

	if(!obj.select) {
		let res = await admin.find({}, {
			pwd: false,
			resource: false
		}).skip((current - 1) * size).limit(size).sort({
			vip1: 1,
			_id: 1
		})
		console.log('后台获取所有admin')
		ctx.body = {
			data: res,
			total: total
		}
	}else{
		let obj1 = {}
		obj1[obj.select] = new RegExp(obj.inputTxt)
		
		let res = await admin.find(obj1, {
			pwd: false,
			resource: false
		}).skip((current - 1) * size).limit(size).sort({
			vip1: 1,
			_id: 1
		})
		
		let total = res.length
		
		console.log( '后台获取' + obj.select +'admin')
		ctx.body = {
			data: res,
			total: total
		}
	}

})
//后台更新admin
router.put('/admin', async(ctx, next) => {
	let web = ctx.request.body
	let res = await admin.updateOne({
		_id: web._id
	}, {
		vip: web.vip,
		vip1: web.vip1
	})
	if(res) {
		console.log(web._id + '后台更新admin')
		ctx.body = true
	}

})

//后台删除admin
router.delete('/admin', async(ctx, next) => {
	let _id = ctx.query._id
	let res = await admin.deleteOne({
		_id
	})
	console.log(_id+'后台删除admin')
	ctx.body = res
})




//后台获取主题
router.get('/zhuTi', async(ctx, next) => {
	let total = await zhuTi.countDocuments()
	let size = +ctx.query.size
	let current = +ctx.query.current
	let obj = JSON.parse(ctx.query.obj)
	if(obj.inputTxt || obj.label){
		if(obj.label){
			let data = await zhuTi.find({
				label: {
					$in: obj.label
				}
			})
			
			let arr = []
			let arr1 = []
			let total = data.length
			for(let i = 0; arr.length<size; i++){
				arr.push(Math.round(Math.random()*(total-1)))
				arr = Array.from(new Set(arr))
			}
			for(let i = 0; i<size; i++){
				arr1.push(data[arr[i]])
			}
			
			data = arr1
			
			console.log('根据标签获取主题')
			ctx.body = {
				total,
				data
			}
		}else if(obj.select === 'label'){
			let data = await zhuTi.find({
				label: {
					$in: obj.inputTxt
				}
			})
			
			let total = data.length
			
			console.log('根据标签获取主题')
			ctx.body = {
				total,
				data
			}
		}else{
			let obj1 = {}
			obj1[obj.select] = new RegExp(obj.inputTxt)
			let data = await zhuTi.find(obj1).skip((current - 1) * size).limit(size).sort({
				_id: -1
			})
			
			let total = data.length
			console.log(total)
			
			console.log('根据标题获取主题')
			ctx.body = {
				total,
				data
			}
		}
	}else {
		let data = await zhuTi.find().skip((current - 1) * size).limit(size).sort({
			_id: -1
		})
		console.log('获取主题')
		ctx.body = {
			total,
			data
		}
	}
})

//后台获取单个主题
router.get('/zhuTiOne', async(ctx, next) => {
	let _id = ctx.query._id
	let res = await zhuTi.findOne({_id})
	if(res) {
		console.log(_id + '后台获取单个主题')
		ctx.body = res
	}

})

//添加主题图片
	//处理前段上传来的图片资源
let zhuTiStorage = multer.diskStorage({
	//创建文件保存路径
	destination: function (req, file, cb) {
    	cb(null, 'src/static/imgZhuTi/')
	},
    //修改文件名称
	filename: function (req, file, cb) {
		let _time = new Date()
		let _type = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
		let end = _type[_type.length-1]
		_type.pop()
		let name = _type.join("")
		cb(null,'zhuti' + "_"+ name + "." + end)
	}
})

//tool就是一个接收器的实例，在实例时至少要告诉它 图片 存储的地址
let tool = multer({storage: zhuTiStorage})

//在/upload请求响应时，就接收单独的一张图片
router.post("/uploadZhuTi",tool.single("file"),(ctx,next)=>{
	console.log(ctx.req.file.filename + '添加成功')
	ctx.body=ctx.req.file.filename//返回文件名	           
})


//后台删除主题图片
router.delete('/delImgZhuTi',async (ctx,next)=>{
	let name = ctx.query.name 
	fs.exists("./src/static/imgZhuTi/"+name,flag=>{
		if(flag){
			fs.unlink("./src/static/imgZhuTi/"+name,err=>{
				console.log( name + "删除成功" )
				ctx.body = "删除成功"
			})
		}else{
			console.log("文件不存在")
		}
	})
})

//后台添加主题
router.post('/addZhuTi', async (ctx,next)=>{
	let web = ctx.request.body
	let one = await new zhuTi(web)
		one.save()
	console.log('主题添加成功')
	ctx.body = '主题添加成功'
})

//后台更新主题
router.put('/zhuTi', async(ctx, next) => {
	let web = ctx.request.body
	console.log(web)
	let res = await zhuTi.updateOne({
		_id: web._id
	}, web.data)
	if(res) {
		console.log(web._id + '后台更新zhuTi')
		ctx.body = '后台更新zhuTi成功'
	}

})

//删除主题
router.delete('/zhuTi', async(ctx, next) => {
	let _id = ctx.query._id
	let res = await zhuTi.deleteOne({
		_id
	})
	console.log(_id+'后台删除zhuTi')
	ctx.body = res
})




//添加字体图片
	//处理前段上传来的图片资源
let fontStorage = multer.diskStorage({
	//创建文件保存路径
	destination: function (req, file, cb) {
    	cb(null, 'src/static/imgFont/')
	},
    //修改文件名称
	filename: function (req, file, cb) {
		let _time = new Date()
		let _type = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
		let end = _type[_type.length-1]
		_type.pop()
		let name = _type.join("")
		cb(null,'font' + "_"+ name + "." + end)
	}
})

//tool就是一个接收器的实例，在实例时至少要告诉它 图片 存储的地址
let tool1 = multer({storage: fontStorage})

//在/upload请求响应时，就接收单独的一张图片
router.post("/uploadFont",tool1.single("file"),(ctx,next)=>{
	console.log(ctx.req.file.filename + '添加成功')
	ctx.body=ctx.req.file.filename//返回文件名	           
})

//添加字体
router.post('/font/addFont', async (ctx,next)=>{
	let web = ctx.request.body
	let one = await new font(web)
		one.save()
	console.log('字体添加成功')
	ctx.body = '字体添加成功'
})



//后台获取字体
router.get('/font', async(ctx, next) => {
	let total = await font.countDocuments()
	let size = +ctx.query.size
	let current = +ctx.query.current
	let obj = JSON.parse(ctx.query.obj)
	if(obj.inputTxt || obj.label){
		if(obj.label){
			let data = await font.find({
				label: {
					$in: obj.label
				}
			})
			
			let arr = []
			let arr1 = []
			let total = data.length
			for(let i = 0; arr.length<size; i++){
				arr.push(Math.round(Math.random()*(total-1)))
				arr = Array.from(new Set(arr))
			}
			for(let i = 0; i<size; i++){
				arr1.push(data[arr[i]])
			}
			
			data = arr1
			
			console.log('根据标签获取字体')
			ctx.body = {
				total,
				data
			}
		}else if(obj.select === 'label'){
			let data = await font.find({
				label: {
					$in: obj.inputTxt
				}
			}).skip((current - 1) * size).limit(size).sort({
				_id: -1
			})
			
			let total = data.length
			
			console.log('根据标签获取字体')
			ctx.body = {
				total,
				data
			}
		}else{
			let obj1 = {}
			obj1[obj.select] = new RegExp(obj.inputTxt)
			let data = await font.find(obj1).skip((current - 1) * size).limit(size).sort({
				_id: -1
			})
			
			let total = data.length
			
			console.log('根据标题获取主题')
			ctx.body = {
				total,
				data
			}
		}
	}else {
		let data = await font.find().skip((current - 1) * size).limit(size).sort({
			_id: -1
		})
		console.log('获取字体')
		ctx.body = {
			total,
			data
		}
	}
})

//后台获取单个字体
router.get('/fontOne', async(ctx, next) => {
	let _id = ctx.query._id
	let res = await font.findOne({_id})
	if(res) {
		console.log(_id + '后台获取单个字体')
		ctx.body = res
	}

})

//后台更新字体
router.put('/font', async(ctx, next) => {
	let web = ctx.request.body
	console.log(web)
	let res = await font.updateOne({
		_id: web._id
	}, web.data)
	if(res) {
		console.log(web._id + '后台更新font')
		ctx.body = '后台更新font成功'
	}

})

//删除字体
router.delete('/font', async(ctx, next) => {
	let _id = ctx.query._id
	let res = await font.deleteOne({
		_id
	})
	console.log(_id+'后台删除font')
	ctx.body = res
})

//添加音乐
	//处理前段上传来的图片资源
let musicStorage = multer.diskStorage({
	//创建文件保存路径
	destination: function (req, file, cb) {
    	cb(null, 'src/static/music/')
	},
    //修改文件名称
	filename: function (req, file, cb) {
		let _time = new Date()
		let _type = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
		let end = _type[_type.length-1]
		_type.pop()
		let name = _type.join("")
		cb(null,'music' + "_"+ name + "." + end)
	}
})

//tool就是一个接收器的实例，在实例时至少要告诉它 图片 存储的地址
let tool2 = multer({storage: musicStorage})

//在/upload请求响应时，就接收单独的一张图片
router.post("/uploadMusic",tool2.single("file"),(ctx,next)=>{
	console.log(ctx.req.file.filename + '添加成功')
	ctx.body=ctx.req.file.filename//返回文件名	           
})

//添加音乐
router.post('/music/addMusic', async (ctx,next)=>{
	let web = ctx.request.body
	let one = await new music(web)
		one.save()
	console.log('音乐添加成功')
	ctx.body = '音乐添加成功'
})



//后台获取音乐
router.get('/music', async(ctx, next) => {
	let total = await music.countDocuments()
	let size = +ctx.query.size
	let current = +ctx.query.current
	let obj = JSON.parse(ctx.query.obj)
	console.log(obj)
	if(obj.inputTxt){
		let obj1 = {}
		obj1[obj.select] = new RegExp(obj.inputTxt)
		let data = await music.find(obj1).skip((current - 1) * size).limit(size).sort({
			_id: -1
		})
		
		let total = data.length
		
		console.log('根据标题获取音乐')
		ctx.body = {
			total,
			data
		}
	}else {
		let data = await music.find().skip((current - 1) * size).limit(size).sort({
			_id: -1
		})
		console.log('获取音乐')
		ctx.body = {
			total,
			data
		}
	}
})

//后台更新音乐
router.put('/music', async(ctx, next) => {
	let web = ctx.request.body
	console.log(web)
	let res = await music.updateOne({
		_id: web._id
	}, web.data)
	if(res) {
		console.log(web._id + 'music')
		ctx.body = '后台更新music成功'
	}

})

//删除音乐
router.delete('/music', async(ctx, next) => {
	let _id = ctx.query._id
	let res = await music.deleteOne({
		_id
	})
	console.log(_id+'后台删除music')
	ctx.body = res
})
