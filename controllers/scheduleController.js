const cron = require('node-cron');
const ScheduledMessage = require('../models/ScheduledMessage');

// Task 2, Point 2: Scheduled Post Service
exports.scheduleMessage = async (req, res) => {

    console.log('current date schedule message API tr>>>',new Date().toLocaleTimeString());
    const { message, day, time } = req.body || {};
    const dateformatOption = { weekday: "long", year: "numeric", month: "long", day: "numeric",hour: "2-digit",
                               minute: "2-digit", second: "2-digit"
                             };
    

    if (!message || !day || !time) {
        return res.status(400).json({ msg: 'Please provide message, day, and time.' });
    }

    try {
        const [hour, minute] = time.split(':');
        const scheduledDate = new Date();

        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = daysOfWeek.indexOf(day.toLowerCase());

        if (targetDay === -1) {
            return res.status(400).json({ msg: 'Invalid day provided. Use e.g., "monday".' });
        }

        const currentDay = scheduledDate.getDay();
        // console.log('currentDay >>>>>',currentDay)
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        // console.log('daysUntilTarget >>>>',daysUntilTarget)
        
        scheduledDate.setDate(scheduledDate.getDate() + daysUntilTarget);
        scheduledDate.setHours(hour, minute, 0, 0);

        if (scheduledDate < new Date()) {
            scheduledDate.setDate(scheduledDate.getDate() + 7);
        }

        const job = cron.schedule(`${minute} ${hour} * * ${targetDay}`, async () => {
            const scheduledMsg = new ScheduledMessage({
                message,
                scheduledTime: scheduledDate,
                insertedAt: new Date()
            });
            await scheduledMsg.save();
            console.log(`Message "${message}" inserted into DB at ${new Date().toISOString()}`);
            job.stop();
        }, {
            scheduled: true,
            timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone
            // timezone: "Asia/Kolkata"
        });
        
  
        res.status(201).json({ msg: `Message "${message}" scheduled to be inserted on ${day} at ${time}.`,
                               scheduledFor: Intl.DateTimeFormat('locale',dateformatOption).format(scheduledDate) 
                            });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({data:'Server Error'});
    }
};