import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express()
app.use(express.json())
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



import userRouter from "./route/user.routes.js"
import videoRouter from "./route/video.routes.js"
import tweetRouter from "./route/tweet.routes.js"
import playListRouter from "./route/playlist.routes.js"
import healthcheckRouter from "./route/healthcheck.routes.js"
import commentRouter from "./route/comment.routes.js"
import dashboardRouter from "./route/dashboard.routes.js"
import likeRouter from "./route/like.routes.js"
import subscriptionRouter from "./route/subscription.routes.js"

app.use("/users",userRouter)
app.use("/videos",videoRouter)
app.use("/tweet",tweetRouter)
app.use("/playlist",playListRouter)
app.use("/healthcheck",healthcheckRouter)
app.use("/comment",commentRouter)
app.use("/dashboard",dashboardRouter)
app.use("/like",likeRouter)
app.use("/subscribe",subscriptionRouter)


export { app }