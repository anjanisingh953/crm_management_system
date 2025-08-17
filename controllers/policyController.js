const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');
require('../models/User');
require('../models/Carrier');
require('../models/Lob');
const Agent = require('../models/Agent');
const Policy = require('../models/Policy');


// Task 1, Point 1: Upload API
// Task 1, Point 1: Upload API
exports.uploadPolicies = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded. Please upload a CSV file with the field name "csvFile".' });
    }

    const filePath = req.file.path;
    const worker = new Worker(path.resolve(__dirname, '../workers/db-worker.js'), {
        workerData: { filePath }
    });

    // Send a response immediately to the client, indicating the job has started.
    // This is the key change for a quick response.
    res.status(200).json({ msg: 'File upload successful. Processing started in the background. Check server logs for progress.' });

    // The 'exit' event handler is now only for server-side cleanup and logging.
    worker.on('exit', (code) => {
        // Clean up the temporary file after the worker is done
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete temporary file:', err);
        });

        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        } else {
            console.log('Worker finished processing file.');
        }
    });

    worker.on('message', (result) => {
        if (result.success) {
            console.log(`Successfully processed record: ${result.policyNumber}`);
        } else {
            console.error(`Failed to process record: ${result.policyNumber || 'N/A'}, Error: ${result.error}`);
        }
    });

    worker.on('error', (err) => {
        console.error('Worker thread error:', err);
    });
};

// exports.uploadPolicies = (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ msg: 'No file uploaded. Please upload a CSV file with the field name "csvFile".' });
//     }

//     const filePath = req.file.path;
//     const worker = new Worker(path.resolve(__dirname, '../workers/db-worker.js'), {
//         workerData: { filePath }
//     });

//     worker.on('message', (result) => {
//         if (result.success) {
//             console.log(`Successfully processed record: ${result.policyNumber}`);
//         } else {
//             console.error(`Failed to process record: ${result.policyNumber || 'N/A'}, Error: ${result.error}`);
//         }
//     });

//     worker.on('exit', (code) => {
//         // Clean up the temporary file after the worker is done
//         fs.unlink(filePath, (err) => {
//             if (err) console.error('Failed to delete temporary file:', err);
//         });

//         if (code !== 0) {
//             console.error(`Worker stopped with exit code ${code}`);
//             return res.status(500).json({ msg: 'File processing failed.' });
//         }

//         res.status(200).json({ msg: 'File upload and processing started successfully.' });
//     });

//     worker.on('error', (err) => {
//         console.error('Worker thread error:', err);
//         res.status(500).json({ msg: 'An error occurred during file processing.' });
//     });
// };

// Task 1, Point 2: Search API by Username (Agent name)
exports.searchPoliciesByUsername = async (req, res) => {
    console.log('req.params',req.params);
    try {
        const { username } = req.params;
        const agent = await Agent.findOne({ name: username });
        
        // console.log('agent >>>>>',agent)

        if (!agent) {
            return res.status(404).json({ msg: 'Agent not found.' });
        }

        const policies = await Policy.find({ agentId: agent._id })
            .populate('userId', 'firstName dob') 
            .populate('carrierId', 'name')
            .populate('lobId', 'name')
            .select('-__v');

        res.status(200).json({ agent, policies });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Task 1, Point 3: Aggregated Policy by Username (Agent name)
exports.getAggregatedPolicies = async (req, res) => {
    try {
        const aggregationResult = await Policy.aggregate([
            {
                $lookup: {
                    from: 'agents', // Join with the 'agents' collection
                    localField: 'agentId',
                    foreignField: '_id',
                    as: 'agentInfo'
                }
            },
            {
                $unwind: '$agentInfo' // Deconstruct the agentInfo array
            },
            {
                $group: {
                    _id: '$agentId', // Group by Agent ID
                    agentName: { $first: '$agentInfo.name' }, // Get the agent's name
                    policyCount: { $sum: 1 },
                    policies: { 
                        $push: { 
                            policyNumber: '$policyNumber', 
                            premium: '$premiumAmount' 
                        } 
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    agentName: 1,
                    policyCount: 1,
                    policies: 1
                }
            }
        ]);
        res.json(aggregationResult);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
