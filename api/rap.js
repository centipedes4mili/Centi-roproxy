export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    
    try {
        // Method 1: Try Rolimons API directly
        const apiResponse = await fetch(`https://api.rolimons.com/players/v1/playerinfo/${userId}`);
        
        if (apiResponse.ok) {
            const data = await apiResponse.json();
            return res.json({
                success: true,
                rap: data.total_rap || 0,
                value: data.total_value || 0,
                userId: userId
            });
        }
        
        // Method 2: Fallback - scrape Rolimons website
        const webResponse = await fetch(`https://www.rolimons.com/player/${userId}`);
        const html = await webResponse.text();
        
        // Extract RAP from HTML
        const rapMatch = html.match(/data-rap="(\d+)"/);
        const rap = rapMatch ? parseInt(rapMatch[1]) : 0;
        
        return res.json({
            success: true,
            rap: rap,
            value: rap,
            userId: userId
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch RAP data'
        });
    }
}
