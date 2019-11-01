let mongo = require('mongoose')
mongo.connect("mongodb://127.0.0.1:27017/zhuti",{ useNewUrlParser: true, useUnifiedTopology: true  })
mongo.connection.on('connected',err=>{
	console.log('数据库连接成功')
})
mongo.connection.on('error',err=>{
	console.log('数据库连接失败')
})

let adminHeader = mongo.Schema({
	adminName: String,
	pwd: String,
	userName: String,
	address: String,
	phone: String,
	resource: String,
	time: {
		type: Date,
		default: new Date()
	},
	vip: {
		type: String,
		default: '后台预览'
	},
	vip1: {
		type: Number,
		default: 3
	}
})

let admin = mongo.model('admin',adminHeader)

let zhuTiHeader = mongo.Schema({
	ttl: String,
	download: {
		type: String,
		default: '12000'
	},
	price: String,
	time: {
		type: Date,
		default: new Date()
	},
	label: Array,
	intro: Object,
	src: Array,
	discuss: {
		type: Array,
		default: []
	}
})

let zhuTi = mongo.model('zhuTi',zhuTiHeader)

let fontHeader = mongo.Schema({
	ttl: String,
	download: {
		type: String,
		default: '12000'
	},
	price: String,
	time: {
		type: Date,
		default: new Date()
	},
	label: Array,
	intro: Object,
	src: Array,
	discuss: {
		type: Array,
		default: []
	}
})

let font = mongo.model('font',fontHeader)


let musicHeader = mongo.Schema({
	ttl: String,
	ttl1: String,
	src: Array,
	download: {
		type: String,
		default: '12000'
	},
	time: {
		type: Date,
		default: new Date()
	}
})

let music = mongo.model('music',musicHeader)




module.exports = { admin,  zhuTi, font, music}