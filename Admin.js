const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 3000;
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    database: 'service1',
    username: 'postgres',    
    password: '1', 
    port: 5432,
});
const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    experience: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    photoavatar: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    login: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        validate: {
            isIn: [[1, 2]]
        }
    },
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\+?[1-9]\d{10,11}$/
        }
    }
}, {
    tableName: 'employees',
    timestamps: false,
    underscored: true
});

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\+?[1-9]\d{10,11}$/
        }
    },
    feature: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'clients',
    timestamps: false,
    underscored: true
});

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'services',
    timestamps: false,
    underscored: true
});

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    clientid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employeeid: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'appointments',
    timestamps: false,
    underscored: true
});

// Добавить новую модель для связи Employee и Service
const EmployeeService = sequelize.define('EmployeeService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    employeeid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    serviceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Service,
            key: 'id'
        }
    }
}, {
    tableName: 'employee_services',
    timestamps: false,
    underscored: true
});

// Обновить связи между таблицами
Employee.belongsToMany(Service, { through: EmployeeService, foreignKey: 'employeeid' });
Service.belongsToMany(Employee, { through: EmployeeService, foreignKey: 'serviceid' });

// Добавьте эти связи после определения моделей и перед синхронизацией
Appointment.belongsTo(Client, { foreignKey: 'clientid' });
Appointment.belongsTo(Employee, { foreignKey: 'employeeid' });
Appointment.belongsTo(Service, { foreignKey: 'serviceid' });

// Добавить модель Profession после существующих моделей
const Profession = sequelize.define('Profession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'professions',
    timestamps: false,
    underscored: true
});

// Добавить модель для связи Employee и Profession
const EmployeeProfession = sequelize.define('EmployeeProfession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    employeeid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    professionid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Profession,
            key: 'id'
        }
    }
}, {
    tableName: 'employee_professions',
    timestamps: false,
    underscored: true
});

// Добавить связи между Employee и Profession
Employee.belongsToMany(Profession, { through: EmployeeProfession, foreignKey: 'employeeid' });
Profession.belongsToMany(Employee, { through: EmployeeProfession, foreignKey: 'professionid' });

// Проверка подключения и синхронизация моделей
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Успешно подключено к PostgreSQL через Sequelize');
        
        // Изменяем параметры синхронизации
        await sequelize.sync({ alter: true }); 
        
        console.log('Таблицы успешно синхронизированы');
    } catch (error) {
        console.error('Ошибка подключения к базе:', error);
    }
})();

// Middleware для парсинга JSON и form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для страницы авторизации (начальная страница)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для страницы администратора
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Добавьте этот новый маршрут
app.get('/adminemployee', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminemployee.html'));
});

// Маршрут для страницы сотрудника
app.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employee.html'));
});

// Маршрут для страницы услуг
app.get('/adminservice', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminservice.html'));
});

// Маршрут для страницы профессий
app.get('/adminprof', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminprof.html'));
});

// Маршрут для страницы клиентов
app.get('/adminclient', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminclient.html'));
});

// Маршрут для страницы расписания
app.get('/adminschedule', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminschedule.html'));
});

// API для авторизации
app.post('/api/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        
        // Ищем сотрудника с указанным логином и паролем
        const employee = await Employee.findOne({ 
            where: { 
                login: login,
                password: password
            } 
        });
        
        if (!employee) {
            return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
        }
        
        // Определяем, куда перенаправить пользователя в зависимости от его роли
        const redirectTo = employee.role === 1 ? '/admin' : '/employee';
        
        res.json({ 
            success: true, 
            redirect: redirectTo,
            user: {
                id: employee.id,
                name: employee.name,
                role: employee.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для получения всех сотрудников
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [
                {
                    model: Service,
                    through: { attributes: [] }
                },
                {
                    model: Profession,
                    through: { attributes: [] }
                }
            ]
        });
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Добавьте новый endpoint после существующих
app.post('/api/employees/add', upload.single('photoavatar'), async (req, res) => {
    try {
        const employeeData = {
            name: req.body.name,
            age: parseInt(req.body.age),
            experience: parseInt(req.body.experience),
            phonenumber: req.body.phonenumber,
            login: req.body.login,
            password: req.body.password,
            role: parseInt(req.body.role)
        };

        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            employeeData.photoavatar = base64Image;
        }

        // Создаем сотрудника
        const employee = await Employee.create(employeeData);

        // Добавляем связи с услугами
        const serviceIds = Array.isArray(req.body.serviceids) ? req.body.serviceids : [req.body.serviceids];
        await Promise.all(serviceIds.map(serviceid => 
            EmployeeService.create({
                employeeid: employee.id,
                serviceid: parseInt(serviceid)
            })
        ));

        // Добавляем связи с профессиями
        const professionIds = Array.isArray(req.body.professionids) ? req.body.professionids : [req.body.professionids];
        await Promise.all(professionIds.map(professionid => 
            EmployeeProfession.create({
                employeeid: employee.id,
                professionid: parseInt(professionid)
            })
        ));
        
        res.json({ 
            success: true, 
            message: 'Сотрудник успешно добавлен',
            employee: employee
        });
    } catch (error) {
        console.error('Ошибка при добавлении сотрудника:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при добавлении сотрудника'
        });
    }
});

// API для добавления новой услуги
app.post('/api/services/add', async (req, res) => {
    try {
        const serviceData = {
            name: req.body.name,
            description: req.body.description,
            price: parseInt(req.body.price)
        };

        const service = await Service.create(serviceData);
        
        res.json({ 
            success: true, 
            message: 'Услуга успешно добавлена',
            service: service
        });
    } catch (error) {
        console.error('Ошибка при добавлении услуги:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при добавлении услуги'
        });
    }
});

// API для получения всех услуг
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// API для добавления нового клиента
app.post('/api/clients/add', async (req, res) => {
    try {
        const clientData = {
            name: req.body.name,
            phonenumber: req.body.phonenumber,
            feature: req.body.feature
        };

        const client = await Client.create(clientData);
        
        res.json({ 
            success: true, 
            message: 'Клиент успешно добавлен',
            client: client
        });
    } catch (error) {
        console.error('Ошибка при добавлении клиента:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при добавлении клиента'
        });
    }
});

// API для добавления новой записи
app.post('/api/appointments/add', async (req, res) => {
    try {
        const { date, time, employeeid } = req.body;
        
        // Validate working hours (10:00 - 18:00)
        const hour = parseInt(time.split(':')[0]);
        if (hour < 10 || hour > 18) {
            return res.status(400).json({
                success: false,
                message: 'Время записи должно быть с 10:00 до 18:00'
            });
        }
        
        // Validate weekday
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.status(400).json({
                success: false,
                message: 'Записи доступны только в рабочие дни (Пн-Пт)'
            });
        }
        
        // Check if the time slot is already booked
        const existingAppointment = await Appointment.findOne({
            where: {
                date: date,
                time: time,
                employeeid: employeeid
            }
        });
        
        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'Это время уже занято'
            });
        }

        // Create the appointment if all validations pass
        const appointmentData = {
            clientid: parseInt(req.body.clientid),
            serviceid: parseInt(req.body.serviceid),
            employeeid: parseInt(req.body.employeeid),
            date: date,
            time: time
        };

        const appointment = await Appointment.create(appointmentData);
        
        res.json({ 
            success: true, 
            message: 'Запись успешно добавлена',
            appointment: appointment
        });
    } catch (error) {
        console.error('Ошибка при добавлении записи:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при добавлении записи'
        });
    }
});

// Добавьте этот эндпоинт в Admin.js
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);

        // Сначала удаляем все записи (appointments) этого сотрудника
        await Appointment.destroy({
            where: {
                employeeid: employeeId
            }
        });

        // Удаляем связи сотрудника с услугами
        await EmployeeService.destroy({
            where: {
                employeeid: employeeId
            }
        });

        // Удаляем самого сотрудника
        const result = await Employee.destroy({
            where: {
                id: employeeId
            }
        });

        if (result) {
            res.json({ success: true, message: 'Сотрудник и связанные данные успешно удалены' });
        } else {
            res.status(404).json({ success: false, message: 'Сотрудник не найден' });
        }
    } catch (error) {
        console.error('Ошибка при удалении сотрудника:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при удалении сотрудника' 
        });
    }
});

// API для получения всех записей с информацией о клиентах, сотрудниках и услугах
app.get('/api/appointments/all', async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                {
                    model: Client,
                    attributes: ['name', 'phonenumber']
                },
                {
                    model: Employee,
                    attributes: ['name']
                },
                {
                    model: Service,
                    attributes: ['name', 'price']
                }
            ],
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Ошибка при получении записей' });
    }
});

// Получение данных сотрудника по ID
app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Service,
                    through: { attributes: [] }
                },
                {
                    model: Profession,
                    through: { attributes: [] }
                }
            ]
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Сотрудник не найден' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Ошибка при получении данных сотрудника:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при получении данных сотрудника' 
        });
    }
});

// Обновление данных сотрудника
app.put('/api/employees/:id', upload.single('photoavatar'), async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const employeeData = {
            name: req.body.name,
            age: parseInt(req.body.age),
            experience: parseInt(req.body.experience),
            phonenumber: req.body.phonenumber,
            login: req.body.login
        };

        // Обновляем пароль только если он был предоставлен
        if (req.body.password) {
            employeeData.password = req.body.password;
        }

        // Обновляем фото только если оно было предоставлено
        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            employeeData.photoavatar = base64Image;
        }

        // Обновляем данные сотрудника
        await Employee.update(employeeData, {
            where: { id: employeeId }
        });

        // Обновляем связи с услугами
        await EmployeeService.destroy({
            where: { employeeid: employeeId }
        });

        const serviceIds = Array.isArray(req.body.serviceids) ? req.body.serviceids : [req.body.serviceids];
        await Promise.all(serviceIds.map(serviceid => 
            EmployeeService.create({
                employeeid: employeeId,
                serviceid: parseInt(serviceid)
            })
        ));

        // Обновляем связи с профессиями
        await EmployeeProfession.destroy({
            where: { employeeid: employeeId }
        });

        const professionIds = Array.isArray(req.body.professionids) ? req.body.professionids : [req.body.professionids];
        await Promise.all(professionIds.map(professionid => 
            EmployeeProfession.create({
                employeeid: employeeId,
                professionid: parseInt(professionid)
            })
        ));

        res.json({ 
            success: true, 
            message: 'Данные сотрудника успешно обновлены'
        });
    } catch (error) {
        console.error('Ошибка при обновлении данных сотрудника:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при обновлении данных сотрудника' 
        });
    }
});

// Добавьте этот эндпоинт в Admin.js
app.delete('/api/services/:id', async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);

        // Сначала удаляем все записи с этой услугой
        await Appointment.destroy({
            where: {
                serviceid: serviceId
            }
        });

        // Удаляем связи услуги с сотрудниками
        await EmployeeService.destroy({
            where: {
                serviceid: serviceId
            }
        });

        // Удаляем саму услугу
        const result = await Service.destroy({
            where: {
                id: serviceId
            }
        });

        if (result) {
            res.json({ success: true, message: 'Услуга и связанные данные успешно удалены' });
        } else {
            res.status(404).json({ success: false, message: 'Услуга не найдена' });
        }
    } catch (error) {
        console.error('Ошибка при удалении услуги:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при удалении услуги' 
        });
    }
});

// Получение данных услуги по ID
app.get('/api/services/:id', async (req, res) => {
    try {
        const service = await Service.findOne({
            where: { id: req.params.id }
        });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Услуга не найдена' });
        }

        res.json(service);
    } catch (error) {
        console.error('Ошибка при получении данных услуги:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при получении данных услуги' 
        });
    }
});

// Добавьте этот эндпоинт в Admin.js
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.id);

        // Удаляем запись
        const result = await Appointment.destroy({
            where: {
                id: appointmentId
            }
        });

        if (result) {
            res.json({ success: true, message: 'Запись успешно удалена' });
        } else {
            res.status(404).json({ success: false, message: 'Запись не найдена' });
        }
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при удалении записи' 
        });
    }
});

// Исправляем эндпоинт проверки доступности
app.get('/api/appointments/check-availability', async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        
        // Get all appointments for the specified date and employee
        const appointments = await Appointment.findAll({
            where: {
                date: date,
                employeeid: employeeId
            },
            attributes: ['time']
        });
        
        // Return array of booked time slots
        const bookedSlots = appointments.map(apt => apt.time);
        res.json(bookedSlots);
    } catch (error) {
        console.error('Ошибка при проверке доступности:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при проверке доступности' 
        });
    }
});

// Добавить API endpoints для профессий
app.get('/api/professions', async (req, res) => {
    try {
        const professions = await Profession.findAll();
        res.json(professions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Добавить API endpoints для профессий
app.post('/api/professions/add', async (req, res) => {
    try {
        const professionData = {
            name: req.body.name,
            description: req.body.description
        };

        const profession = await Profession.create(professionData);
        
        res.json({ 
            success: true, 
            message: 'Профессия успешно добавлена',
            profession: profession
        });
    } catch (error) {
        console.error('Ошибка при добавлении профессии:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при добавлении профессии'
        });
    }
});

app.put('/api/professions/:id', async (req, res) => {
    try {
        const professionId = parseInt(req.params.id);
        const professionData = {
            name: req.body.name,
            description: req.body.description
        };

        const [updated] = await Profession.update(professionData, {
            where: { id: professionId }
        });

        if (updated) {
            res.json({ 
                success: true, 
                message: 'Профессия успешно обновлена'
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Профессия не найдена'
            });
        }
    } catch (error) {
        console.error('Ошибка при обновлении профессии:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при обновлении профессии'
        });
    }
});

app.delete('/api/professions/:id', async (req, res) => {
    try {
        const professionId = parseInt(req.params.id);

        // Сначала удаляем связи профессии с сотрудниками
        await EmployeeProfession.destroy({
            where: {
                professionid: professionId
            }
        });

        // Удаляем саму профессию
        const result = await Profession.destroy({
            where: {
                id: professionId
            }
        });

        if (result) {
            res.json({ success: true, message: 'Профессия успешно удалена' });
        } else {
            res.status(404).json({ success: false, message: 'Профессия не найдена' });
        }
    } catch (error) {
        console.error('Ошибка при удалении профессии:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при удалении профессии'
        });
    }
});

app.get('/api/professions/:id', async (req, res) => {
    try {
        const profession = await Profession.findOne({
            where: { id: req.params.id }
        });

        if (!profession) {
            return res.status(404).json({ success: false, message: 'Профессия не найдена' });
        }

        res.json(profession);
    } catch (error) {
        console.error('Ошибка при получении данных профессии:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Ошибка при получении данных профессии'
        });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});