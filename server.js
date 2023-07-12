const express = require('express')
const cors = require('cors')
const app =express()
const port = 5000

app.use(cors())
app.options('*', cors())


const authRoute = require('./routers/auth')
const pdfRoute = require('./routers/pdf')

app.use('/api/auth', authRoute)
app.use('/api/pdf', pdfRoute)


// Start the ExpressJS application
app.listen(port, () => {
  console.log('Server started on port '+port);
});




