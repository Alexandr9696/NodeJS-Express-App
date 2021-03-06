// подключение библиотек
const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
// подключение handlebars
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const exphbs = require('express-handlebars')
// подключение сессий
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
// подключение Routes
const homeRoutes = require('./routes/home')
const cardRoutes = require('./routes/cart')
const addRoutes = require('./routes/add')
const ordersRoutes = require('./routes/orders')
const coursesRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
// подключение пользовательских middleware
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
// подключение констант
const keys = require('./keys')


const app = express()

// конфигурация handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers')
})

const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI
})

// регистрирация движка handlebars
app.engine('hbs', hbs.engine)
// использование handlebars
app.set('view engine', 'hbs')
app.set('views', 'views')

// статические файлы
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname))
// urlencoded - это метод, встроенный в express для распознавания входящего объекта запроса в виде строк или массивов
app.use(express.urlencoded({extended: true}))
// подключение сессии
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use(fileMiddleware.single('avatar'))

// подключение csrf-защиты
app.use(csrf())
//
app.use(flash())
// подключение пользовательских middleware
app.use(varMiddleware)
app.use(userMiddleware)
// маршрутизация
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

async function start() {
  try {
    // подключение к базе данных MongoDB через mongoose
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()








