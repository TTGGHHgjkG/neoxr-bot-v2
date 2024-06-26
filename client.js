"use strict";
require('events').EventEmitter.defaultMaxListeners = 500
const PORT = process.env.PORT || 7392
const { Baileys, MongoDB, PostgreSQL, Scandir } = new (require('@neoxr/wb'))
const Function = new (require('./lib/system/functions'))
const Func = Function
const spinnies = new (require('spinnies'))(),
      fs = require('fs'),
      path = require('path'),
      colors = require('@colors/colors'),
      stable = require('json-stable-stringify'),
      env = require('./config.json'),
      { platform } = require('os'),
      express = require('express'),
      app = express(),
      http = require('http'),
      nodeCache = require('node-cache');
const cache = new nodeCache({ stdTTL: env.cooldown });

let machine;
if (process.env.DATABASE_URL) {
    if (/mongo/.test(process.env.DATABASE_URL)) {
        MongoDB.db = env.database;
        machine = MongoDB;
    } else if (/postgres/.test(process.env.DATABASE_URL)) {
        machine = PostgreSQL;
    }
} else {
    machine = new (require('./lib/system/localdb'))(env.database);
}

const client = new Baileys({
    type: '--neoxr-v1',
    plugsdir: 'plugins',
    sf: 'session',
    online: true,
    version: [2, 2413, 51]
})

/* starting to connect */
client.on('connect', async res => {
    /* load database */
    global.db = { users: [], chats: [], groups: [], statistic: {}, sticker: {}, setting: {}, ...(await machine.fetch() || {}) };
    
    /* save database */
    await machine.save(global.db);
    
    /* write connection log */
    if (res && typeof res === 'object' && res.message) Func.logFile(res.message);
})

/* print error */
client.on('error', async error => {
    console.log(colors.red(error.message))
    if (error && typeof error === 'object' && error.message) Func.logFile(error.message);
})

/* bot is connected */
client.on('ready', async () => {
    /* auto restart if ram usage is over */
    const ramCheck = setInterval(() => {
        const ramUsage = process.memoryUsage().rss;
        if (ramUsage >= require('bytes')(env.ram_limit)) {
            clearInterval(ramCheck);
            console.log('Memory usage exceeded. Restarting application...');
            process.exit(1); // Gracefully exit the process
        }
    }, 60000); // 60 detik    

    /* server web */
    const runServer = async () => {
        app.set('json spaces', 2);
        app.get("/get-api", async (req, res) => {
            const serverInfo = {
                bot: {
                    users: global.db.users.length,
                    hit: Func.formatNumber(Func.jumlahkanHitStat(global.db.statistic)),
                    msgreceive: Func.formatNumber(global.db.setting.messageReceive),
                    msgssent: Func.formatNumber(global.db.setting.messageSent),
                    datareceive: Func.formatNumber(global.db.setting.receiveSize),
                    dataupload: Func.formatNumber(global.db.setting.uploadSize),
                },
            };
            res.json(serverInfo);
        });
        app.get('/users', (req, res) => {
            res.json({
                message: 'success',
                data: global.db.users
            });
        });

        // Sample POST route untuk menambahkan user
        app.post('/users', (req, res) => {
           const user = req.body;
           global.db.users.push(user);
           res.json({
               message: 'User added successfully',
               data: user
            });
        });
        app.get('/findUser', (req, res) => {
            const userId = req.query.jid;
            if (!userId) {
                return res.status(400).json({
                    message: 'jid parameter is required'
                });
            }
            const user = global.db.users.find(v => v.jid === userId);
            if (user) {
                res.json({
                    message: 'success',
                    data: user
                });
            } else {
                res.status(404).json({
                    message: 'User not found'
                });
            }
        });
        app.get('/', (req, res) => res.send('Server Active!'));
        const server = http.createServer(app);
        server.listen(PORT, () => console.log('Connected to server --', PORT));
    }

    runServer();

    /* create temp directory if doesn't exists */
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    /* additional config */
    require('./lib/system/config');

    /* clear temp folder every 10 minutes */
    setInterval(async () => {
        try {
            const tmpFiles = await fs.promises.readdir('./temp');
            if (tmpFiles.length > 0) {
                await Promise.all(tmpFiles
                    .filter(file => !file.endsWith('.file')) // Filter file penting
                    .map(file => fs.promises.unlink(path.join('./temp', file))));
                tmpFiles.forEach(file => console.log(`Deleted temp file: ${file}`));
            }
        } catch (err) {
            console.error(`Failed to clean temp directory:`, err);
        }
    }, 600000); // 10 menit

    /* save database send http-request every 30 seconds */
    setInterval(async () => {
        if (global.db) await machine.save(global.db);
        if (process.env.CLOVYR_APPNAME && process.env.CLOVYR_URL && process.env.CLOVYR_COOKIE) {
            try {
                const response = await axios.get(process.env.CLOVYR_URL, {
                    headers: {
                        referer: 'https://clovyr.app/view/' + process.env.CLOVYR_APPNAME,
                        cookie: process.env.CLOVYR_COOKIE
                    }
                });
                Func.logFile(`${response.status} - Application wake-up!`);
            } catch (error) {
                console.error('Failed to send HTTP request:', error);
            }
        }
    }, 30_000);
})

/* print all message object */
client.on('message', ctx => {
    require('./handler')(client.sock, ctx);
    require('./lib/system/baileys')(client.sock);
    require('./lib/system/functions');
    require('./lib/system/scraper');
})

/* AFK detector */
client.on('presence.update', update => {
    if (!update) return;
    const sock = client.sock;
    const { id, presences } = update;
    if (id.endsWith('g.us')) {
        for (let jid in presences) {
            if (!presences[jid] || jid == sock.decodeJid(sock.user.id)) continue;
            if ((presences[jid].lastKnownPresence === 'composing' || presences[jid].lastKnownPresence === 'recording') && global.db && global.db.users && global.db.users.find(v => v.jid == jid) && global.db.users.find(v => v.jid == jid).afk > -1) {
                sock.reply(id, `System detects activity from @${jid.replace(/@.+/, '')} after being offline for : ${Func.texted('bold', Func.toTime(new Date - global.db.users.find(v => v.jid == jid).afk))}\n\n➠ ${Func.texted('bold', 'Reason')} : ${global.db.users.find(v => v.jid == jid).afkReason ? global.db.users.find(v => v.jid == jid).afkReason : '-'}`, global.db.users.find(v => v.jid == jid).afkObj);
                global.db.users.find(v => v.jid == jid).afk = -1;
                global.db.users.find(v => v.jid == jid).afkReason = '';
                global.db.users.find(v => v.jid == jid).afkObj = {};
            }
        }
    }
})

client.on('group.add', async ctx => {
    const sock = client.sock;
    const text = `Thanks +tag for joining into +grup group.`;
    await Func.delay(1500); // Penundaan sebelum mengambil gambar profil
    const groupSet = global.db.groups.find(v => v.jid == ctx.jid);
    try {
        var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.member, 'image'));
    } catch {
        var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.jid, 'image'));
    }

    /* localonly to remove new member when the number not from indonesia */
    if (groupSet && groupSet.localonly) {
        if (global.db.users.some(v => v.jid == ctx.member) && !global.db.users.find(v => v.jid == ctx.member).whitelist && !ctx.member.startsWith('62') || !ctx.member.startsWith('62')) {
            sock.reply(ctx.jid, Func.texted('bold', `Sorry @${ctx.member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`));
            sock.updateBlockStatus(ctx.member, 'block');
            return await Func.delay(2000).then(() => sock.groupParticipantsUpdate(ctx.jid, [ctx.member], 'remove'));
        }
    }

    const txt = (groupSet && groupSet.text_welcome ? groupSet.text_welcome : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`);
    await Func.delay(1500); // Penundaan sebelum mengirim welcome msg
    if (groupSet && groupSet.welcome) sock.sendMessageModify(ctx.jid, txt, null, {
        largeThumb: true,
        thumbnail: pic,
        url: global.db.setting.link
    });
})

client.on('group.remove', async ctx => {
   const sock = client.sock;
   const text = `Good bye +tag :)`;
   await Func.delay(1500); // Penundaan sebelum mengambil gambar profil
   const groupSet = global.db.groups.find(v => v.jid == ctx.jid);
   try {
       var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.member, 'image'));
   } catch {
       var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.jid, 'image'));
   }
   const txt = (groupSet && groupSet.text_left ? groupSet.text_left : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`);
   await Func.delay(1500); // Penundaan sebelum mengirim left msg
   if (groupSet && groupSet.left) sock.sendMessageModify(ctx.jid, txt, null, {
       largeThumb: true,
       thumbnail: pic,
       url: global.db.setting.link
   });
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Misalnya, restart aplikasi atau kirim notifikasi admin
});


//client.on('caller', ctx => {
//    if (typeof ctx === 'boolean') return;
//    client.sock.updateBlockStatus(ctx.jid, 'block');
//})

// client.on('group.promote', ctx => console.log(ctx))
// client.on('group.demote', ctx => console.log(ctx))
