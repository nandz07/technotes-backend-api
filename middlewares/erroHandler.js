const {logEvents}=require('./logger')

const errorHandler=(err,req, res ,next)=>{
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500 // server error 

    res.status(status)

    res.json({ message: err.message,
        isError:true // set for RTK query , we have to ask backend developer to set this as a front end dev using RTK
     })
}

module.exports=errorHandler