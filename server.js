const express = require('express')
const cors = require('cors')
const app =express()
const port = 5000


app.use(cors())
app.get("/api", (req, res) => {
    res.json({"users": ["userOne", "userTwo","userThree"]})
})
app.listen(5000, () => {
    console.log("server started on port 5000")
})

