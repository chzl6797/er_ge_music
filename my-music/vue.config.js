const axios = require('axios')
const bodyParser = require('body-parser')
const path = require('path');//引入path模块

function resolve(dir){
    return path.join(__dirname,dir)//path.join(__dirname)设置绝对路径
}
module.exports={
    chainWebpack:(config)=>{
        config.resolve.alias
        .set('@',resolve('./src'))
        .set('api',resolve('./src/api'))
        .set('base',resolve('./src/base'))
        .set('common',resolve('./src/common'))
        .set('components',resolve('./src/components'))
        //set第一个参数：设置的别名，第二个参数：设置的路径
    },
    devServer: {
        before(app) {
            app.use(bodyParser.urlencoded({extended: true}))
    
            app.get('/api/getDiscList', function (req, res) {
                const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
                axios.get(url, {
                    headers: {
                    referer: 'https://c.y.qq.com/',
                    host: 'c.y.qq.com'
                    },
                    params: req.query
                }).then((response) => {
                    res.json(response.data)
                }).catch((e) => {
                    console.log(e)
                })
            }),
            app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
                const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
                axios.post(url, req.body, {
                  headers: {
                    referer: 'https://y.qq.com/',
                    origin: 'https://y.qq.com',
                    'Content-type': 'application/x-www-form-urlencoded'
                  }
                }).then((response) => {
                  res.json(response.data)
                }).catch((e) => {
                  console.log(e)
                })
              })
        }
    }
}