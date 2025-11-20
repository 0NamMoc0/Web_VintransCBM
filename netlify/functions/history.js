const { MongoClient } = require('mongodb');

// Kết nối MongoDB
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    cachedDb = db;
    return db;
}

// Handler chính
exports.handler = async (event, context) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('history');
        
        // CORS headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Content-Type': 'application/json'
        };
        
        // Handle OPTIONS request (CORS preflight)
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: ''
            };
        }
        
        // GET method - Lấy lịch sử
        if (event.httpMethod === 'GET') {
            const { limit = 200, page = 1 } = event.queryStringParameters || {};
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const items = await collection
                .find({})
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray();
            
            const total = await collection.countDocuments();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: items,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                })
            };
        }
        
        // POST method - Thêm lịch sử mới
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            
            // Validate dữ liệu
            if (!body.type || !body.timestamp) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Thiếu trường bắt buộc: type, timestamp'
                    })
                };
            }
            
            // Thêm timestamp nếu chưa có
            if (!body.createdAt) {
                body.createdAt = new Date().toISOString();
            }
            
            const result = await collection.insertOne(body);
            
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        id: result.insertedId,
                        ...body
                    }
                })
            };
        }
        
        // DELETE method - Xóa lịch sử
        if (event.httpMethod === 'DELETE') {
            const { month, all } = event.queryStringParameters || {};
            
            let deleteResult;
            
            if (all === 'true') {
                // Xóa tất cả
                deleteResult = await collection.deleteMany({});
            } else if (month) {
                // Xóa theo tháng (format: MM/YYYY)
                const regex = new RegExp(`^\\d{2}/${month}$`);
                deleteResult = await collection.deleteMany({
                    timestamp: { $regex: regex }
                });
            } else {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Cần tham số month hoặc all=true'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    deleted: deleteResult.deletedCount
                })
            };
        }
        
        // Method không hỗ trợ
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Method không được hỗ trợ'
            })
        };
        
    } catch (error) {
        console.error('History function error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: 'Lỗi server',
                details: error.message
            })
        };
    }
};
