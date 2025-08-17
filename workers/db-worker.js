const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');

// Models
const Agent = require('../models/Agent');
const User = require('../models/User');
const UserAccount = require('../models/UserAccount');
const Lob = require('../models/Lob');
const Carrier = require('../models/Carrier');
const Policy = require('../models/Policy');

connectDB();

const processFile = async () => {
    const { filePath } = workerData;
    const records = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', async () => {
            for (const record of records) {
                // The same record processing logic as before
                try {
                    const session = await mongoose.startSession();
                    session.startTransaction();

                    try {
                        const agent = await Agent.findOneAndUpdate(
                            { name: record.agent },
                            { name: record.agent },
                            { upsert: true, new: true, session }
                        );

                        const user = await User.findOneAndUpdate(
                            { firstName: record.firstname, dob: record.dob },
                            {
                                firstName: record.firstname,
                                dob: record.dob,
                                email: record.email,
                                phone: record.phone,
                                address: record.address,
                                state: record.state,
                                zip: record.zip,
                                gender: record.gender,
                                userType: record.userType
                            },
                            { upsert: true, new: true, session }
                        );

                        await UserAccount.findOneAndUpdate(
                            { name: record.account_name },
                            { name: record.account_name, userId: user._id },
                            { upsert: true, session }
                        );

                        const lob = await Lob.findOneAndUpdate(
                            { name: record.category_name },
                            { name: record.category_name },
                            { upsert: true, new: true, session }
                        );

                        const carrier = await Carrier.findOneAndUpdate(
                            { name: record.company_name },
                            { name: record.company_name },
                            { upsert: true, new: true, session }
                        );

                        const policy = new Policy({
                            policyNumber: record.policy_number,
                            policyStartDate: new Date(record.policy_start_date),
                            policyEndDate: new Date(record.policy_end_date),
                            premiumAmount: record.premium_amount,
                            userId: user._id,
                            agentId: agent._id,
                            carrierId: carrier._id,
                            lobId: lob._id
                        });
                        await policy.save({ session });

                        await session.commitTransaction();
                        parentPort.postMessage({ success: true, policyNumber: record.policy_number });

                    } catch (error) {
                        await session.abortTransaction();
                        parentPort.postMessage({ success: false, policyNumber: record.policy_number, error: error.message });
                    } finally {
                        session.endSession();
                    }
                } catch (err) {
                    console.error('Worker thread error:', err);
                    parentPort.postMessage({ success: false, error: err.message });
                }
            }
        });
};

processFile();
