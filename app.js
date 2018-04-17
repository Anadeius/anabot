const Discord = require('discord.js');
const client = new Discord.Client();
const users = require('./user.js');

const config = require('./config.json'); 
const secret = require('./secret.json');

client.on('ready', () => {
    console.log('Bot is ready');
    client.user.setActivity('Fuck off :)');
});

clean = text => {
    if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@[everyone]+\, /g, "");
    else
        return text;
}

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.info(e));

client.on('guildMemberAdd', (member) => {
    console.log(`New User ${ member.user.username } has joined the server! `);
    let id = member.user.id,
        username = member.user.username,
        tag = member.user.tag,
        joined_discord = member.user.createdAt.toLocaleString(),
        joined_server = member.joinedAt.toLocaleString(),
        roles = member.roles.map(r => { if(r.position > 0) return r.name; }).filter(Boolean);

    users.createUser(id, username, tag, joined_discord, joined_server).then(response =>{
        member.guild.channels.find('name', 'bot').send(response);
    }).catch(err => {
        member.guild.channels.find('name', 'bot').send(err);
    });

    /*User.find({ _id : userID}, (err, userObj) => { 
        if(!userObj.length){
            let newUser = new User({
                _id: userID,
                username: member.user.username,
                tag: member.user.tag,
                discord_joined: new Date(member.user.createdAt).toLocaleString(),
                server_joined: new Date(member.guild.joinedAt).toLocaleString()
            });
    
            newUser.save((err, user) =>{
                if (err) return console.error(err);
                console.log(`New user added, id: ${userID}`);
            })
        }     
    });*/

    member.guild.channels.find('name', 'bot').send(`User ${ member.user.username } has joined! `);
});

client.on('message', async message => {
    if(message.author.bot) return;

    if(!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log(`Command: ${ command } and args ${ args }`);

    if(command === 'ping') {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimeStamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if(command === 'userinfo'){ 
        message.channel.send('', 
        {embed:{
            color: 0xfaaaff,
            thumbnail: {
                url: message.author.avatarURL
            },
            fields: [{
                "name": message.author.tag,
                "value": message.author.presence.game.name
            },
            {
                "name": "Joined Discord on",
                "value": `${DateTime.fromJSDate(message.author.createdAt).toLocaleString(DateTime.DATETIME_MED)} \n(${Math.trunc(DateTime.local().diff(DateTime.fromJSDate(message.author.createdAt), 'days').days)} days ago)`,
                "inline": true
            },
            {
                "name": "Joined this server on",
                "value": `${DateTime.fromJSDate(message.guild.joinedAt).toLocaleString(DateTime.DATETIME_MED)} \n(${Math.trunc(DateTime.local().diff(DateTime.fromJSDate(message.guild.joinedAt), 'days').days)} days ago)`,
                "inline": true
            },
            {
                "name": "Roles",
                "value": clean(message.member.roles.map(r => r.name).join(', '))
            }],
            footer: {
                text: `Member# | User ID: ${message.author.id}`
            }
         }
        });
    }

    if(command === 'dbinfo'){
        let id = message.author.id;
        let user;

        User.find({ _id : id}, (err, userObj) => { 
            if(!userObj.length) {
                message.channel.send('',
                    {embed:{
                        color: red,
                        tite: 'Error',
                        description: 'User not found in DB'                
                    }
                }); 
            }

            user = userObj[0];
            
            message.channel.send('', 
            {embed:{
                color: 0xfaaaff,
                thumbnail: {
                    url: message.author.avatarURL
                },
                fields: [{
                    "name": user.tag,
                    "value": message.author.presence.game.name
                },
                {
                    "name": "Joined Discord on",
                    "value": new Date(user.discord_joined).toUTCString(),
                    "inline": true
                },
                {
                    "name": "Joined this server on",
                    "value": new Date(user.server_joined).toUTCString(),
                    "inline": true
                },
                {
                    "name": "Roles",
                    "value": clean(message.member.roles.map(r => r.name).join(', '))
                }],
                footer: {
                    text: `Member #${user.memberID} | User ID: ${id}`
                }
            }
            });
        });
            
        
                
    }

    if(command === 'time'){
        let time = DateTime.fromJSDate(message.author.createdAt);
        console.log(`Time: ${time}`)
        console.log(time.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS));
    }

    if(command === 'print'){
        message.channel.send(args[0]);
    }

    if(command === 'eval'){
        if(!message.author.id == "102446483793543168") return;
        
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), {code:"xl"});
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }

    if(command === 'testjoin'){
        console.log('testJoin test');
        client.emit('guildMemberAdd', message.member);
    }
    
    if(command === 'finduser'){
       users.findUser(args[0]).then(user =>{
            message.channel.send(user);
       }).catch(err => {
            message.channel.send(err);
       });
    }

    if(command === 'removeuser'){
        users.removeUser(args[0]).then(response =>{
            message.channel.send(response);      
        }).catch(err => {
            message.channel.send(err);
        });
    }
});


client.login(secret.discord_token);
