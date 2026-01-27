
export const USEFUL_TIPS = [
    "Keep your stress low. A stressed boss makes bad decisions.",
    "Don't forget to equip your crew. A gun is better than a fist.",
    "Tagging increases your respect in the neighborhood.",
    "Visit the hospital to heal up after a tough fight.",
    "Recruit different classes to balance your team.",
    "Use tactics to control your crew's behavior in combat.",
    "Check the Daily Times for news and market trends.",
    "Upgrade your holdings to increase daily income.",
    "Keep an eye on your heat. Too much heat brings trouble.",
    "Invest in talents to unlock powerful abilities.",
    "Cash is king, but Respect is power. Don't hoard money if your reputation is zero.",
    "If you see the cops gathering on 5th Ave, go the other way. We don't need the heat.",
    "Diversify. If the drugs bust, you want the gambling to pay the rent.",
    "Never trust a skinny chef, and never trust a smuggler who doesn't drink.",
    "Keep your friends close, and your receipts closer. The tax man is worse than the hitman.",
    "You want loyalty? Hire a dog. You want results? Hire a pro.",
    "Always count the money. Even if it's from your own mother.",
    "A deadlock in the senate is good for business. Chaos is a ladder, boss.",
    "Don't let your enforcers get too bored. Idle hands start fights in our own bars.",
    "The Cartels are moving product through the sewers now. Disgusting, but effective."
];

export const LOCATION_QUOTES: Record<string, string | string[]> = {
    // Landmarks
    'hospital': "I hate this place. Smells like bleach and bad news. Make it quick, Boss.",
    'church': "I haven't been to confession in twenty years. The priest would need a whole week just for me.",
    'times_sq': [
        "The clap in The Neon was worse than the tax man. We called it the 'disco fever.' You got it, and suddenly you’re waltzing with a pharmacist for six weeks. Total hit to the charisma stat, Boss.",
        "My old man said, 'If a dame gives you the Midnight Special, you give her the boot.' It's about reputation, see? You don't let a minor status effect become a major PR problem. Keep the supply chain clean, or you pay extra for the fix.",
        "The Neon... that’s where I met Angelina. Beautiful girl. But she had this idea about 'going legit.' Going legit? That's like asking a shark to eat salad. She left me for a CPA. A CPA, Boss! What a low-level grief.",
        "I watched Angelina dance under that red light for the last time. I ordered a double Scotch, neat. Tasted like betrayal. I learned right there: Never trust a woman who looks good in neon and thinks numbers are sexier than cash. Lesson 101.",
        "I saw Tony the Knife take a pool cue to the face in '82. Why? He ordered a martini shaken, not stirred. In this joint, you don't insult the bartender. Tony got six stitches, but he earned respect. Respect's the only currency that doesn't get seized, remember that.",
        "One night, some meathead from Queens spilled Chianti on the Boss's custom loafers. It was mayhem. I jumped over the bar, broke a chair on his head, and kept pouring my drink. A gentleman always finishes his beverage, even during a critical hit.",
        "Pennsylvania? Fuggedaboutit. I had to go to a strip mall bar near Philly once to shake down a deadbeat. I ordered a Manhattan—they served me whiskey and cranberry juice. That’s when I knew: You wanna start a fight, just criticize their cocktails. It's a faster trigger than a bad debt.",
        "New Jersey guys are worse than Jersey tomatoes—all water and no flavor. One time, a couple of them tried to hit on my girl in The Neon. They looked like bad extras from a Springsteen video. I told them: 'Go back to the turnpike. We only serve Grade-A stupidity here, not whatever that low-grade garbage is.'",
        "You think you’re safe when the bouncer winks? Wrong. The Neon was where you came to get rich, or to disappear. Every exit was an ambush, every door was a trap. It was a high-risk investment zone, Boss, always was.",
        "The real danger wasn't the cops or the rival families. It was the quiet. When the music stopped and the bartender wiped the same spot on the bar for three minutes straight? That meant somebody was getting clipped. Time to finish your drink and leave.",
        "This joint, The Neon Lounge, is high-end. It's restorative. You walk in burnt out, you walk out ready for a turf war. This is where you refresh your action points, kid. It's better than a full night's sleep and way more profitable.",
        "A few shots of premium liquor, some good music, and the right company? It's a quick reset, mentally and physically. You drop fifty bucks at The Neon, and you gain fifty energy back. That’s an ROI you won’t find on Wall Street."
    ],
    'dive_bar': "Watered down whiskey and sticky floors. My kind of place. Keep your wallet in your front pocket.",
    'dock_bk': "The sea air clears the lungs, but the smell of dead fish reminds me of my ex-wife.",
    'dock_qn': "Quiet tonight. Too quiet. Deals happen in the dark here, Boss.",
    'dock_bx': "Industrial waste and rusty containers. Good place to hide things you don't want found.",
    'mafia_hq': "Straighten your tie. We're on holy ground now. Show some respect to the Commission.",
    'bronx_zoo': "Animals in cages. Just like Rikers, but with better food. Don't feed the lions.",
    'yankee': "I lost five grand on a game here in '98. I still hate baseball.",
    'bus_station': "Nothing good ever comes in on a bus. Just trouble looking for a place to stay.",
    'queens': "The Bridge... connects the money to the muscle. Control this, you control the flow.",
    'gambling_den': "The house always wins, unless we burn the house down. Just kidding. Place your bets.",
    
    // Generic Types
    'recruit': "Fresh meat. Look at 'em. Hungry, desperate, and cheap. Perfect.",
    'shop': "Prices are up. Inflation or extortion? Probably both.",
    'commercial': "Small time rackets. Protection money, numbers games. It adds up.",
    'residential': "Regular folks trying to get by. We protect them, they don't talk to the cops. Simple ecosystem.",
    'industrial': "Noisy machinery covers up a lot of screams. Good for... interrogations.",
    'office': "White collar crime pays better, but the hours are boring.",
    'corner': "This corner is prime real estate. Keep the dealers moving.",
    'headquarters': "Home sweet home. Or fortress sweet fortress."
};

// Helper to generate default tags if needed
export const generateDefaultTags = () => {
    return [];
};
