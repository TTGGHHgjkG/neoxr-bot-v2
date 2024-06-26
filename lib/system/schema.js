module.exports = (m, env) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
      if (!isNumber(user.afk)) user.afk = -1
      if (!('afkReason' in user)) user.afkReason = ''
      if (!('afkObj' in user)) user.afkObj = {}
      if (!('name' in user)) user.name= m.pushName
      if (!('bio' in user)) user.bio = 'Not Yet'
      if (!('username' in user)) user.username = 'zuvers'
      if (!('gender' in user)) user.gender = ''
      if (!('banned' in user)) user.banned = false
      if (!isNumber(user.ban_temporary)) user.ban_temporary = 0
      if (!isNumber(user.ban_times)) user.ban_times = 0 
      if (!isNumber(user.limit)) user.limit = env.limit
      if (!('premium' in user)) user.premium = false
      if (!isNumber(user.expired)) user.expired = 0
      if (!isNumber(user.hit)) user.hit = 0
      if (!isNumber(user.warning)) user.warning = 0
      if (!isNumber(user.guard)) user.guard = 0
      if (!isNumber(user.point)) user.point = 0
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.lastclaim)) user.lastclaim = 0
      if (!('code' in user)) user.code = ''
      if (!isNumber(user.codeExpire)) user.codeExpire = 0
      if (!isNumber(user.attempt)) user.attempt = 0
      if (!('email' in user)) user.email = ''
      if (!('verified' in user)) user.verified = false
      if (!('partner' in user)) user.partner = ''
      if (!('authentication' in user)) user.authentication = false
      if (!isNumber(user.tabungan)) user.tabungan = 0
      if (!isNumber(user.saving)) user.saving = 0
      if (!('taken' in user)) user.taken = false
      if (!('transfer_history' in user)) user.transfer_history = []
      if (!('saving_history' in user)) user.saving_history = []
      if (!('history_nabung' in user)) user.history_nabung = []
      if (!('history_penarikan' in user)) user.history_penarikan = []
   } else {
      global.db.users.push({
         jid: m.sender,
     	   afk: -1,
         afkReason: '',
         afkObj: {},
         name: m.pushName,
         bio: 'Not Yet',
         username: 'zuvers',
         gender: '',
         banned: false,
         ban_temporary: 0,
         ban_times: 0,
         limit: env.limit,
         premium: false,
         expired: 0,
         hit: 0,
         warning: 0,
         guard: 0,
         point: 0,
         lastseen: 0,
         lastclaim: 0,
         code: '',
         codeExpire: 0,
         attempt: 0,
         email: '',
         verified: false,
         partner: '',
         authentication: false,
         tabungan: 0,
         saving: 0,
         taken: false,
         transfer_history: [],
         saving_history: [],
         history_nabung: [],
         history_penarikan: []
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         if (!isNumber(group.activity)) group.activity = 0
         if (!('antidelete' in group)) group.antidelete = true
         if (!('antiporn' in group)) group.antiporn = true
         if (!('antilink' in group)) group.antilink = true
         if (!('antivirtex' in group)) group.antivirtex = true
         if (!('filter' in group)) group.filter = false
         if (!('left' in group)) group.left = false
         if (!('localonly' in group)) group.localonly = false
         if (!('mute' in group)) group.mute = false
         if (!('viewonce' in group)) group.viewonce = true
         if (!('autosticker' in group)) group.autosticker = true
         if (!('member' in group)) group.member = {}
         if (!('text_left' in group)) group.text_left = ''
         if (!('text_welcome' in group)) group.text_welcome = ''
         if (!('welcome' in group)) group.welcome = true
         if (!isNumber(group.expired)) group.expired = 0
         if (!('stay' in group)) group.stay = false
      } else {
         global.db.groups.push({
            jid: m.chat,
            activity: 0,
            antidelete: true,
            antiporn: true,
            antilink: false,
            antivirtex: false,
            filter: false,
            left: false,
            localonly: false,
            mute: false,
            viewonce: true,
            autosticker: true,
            member: {},
            text_left: '',
            text_welcome: '',
            welcome: true,
            expired: 0,
            stay: false
         })
      }
   }

   let chat = global.db.chats.find(v => v.jid == m.chat)
   if (chat) {
      if (!isNumber(chat.chat)) chat.chat = 0
      if (!isNumber(chat.lastchat)) chat.lastchat = 0
      if (!isNumber(chat.lastseen)) chat.lastseen = 0
   } else {
      global.db.chats.push({
         jid: m.chat,
         chat: 0,
         lastchat: 0,
         lastseen: 0
      })
   }

   let setting = global.db.setting
   if (setting) {
      if (!('autodownload' in setting)) setting.autodownload = true
      if (!('antispam' in setting)) setting.antispam = false
   	if (!('debug' in setting)) setting.debug = false
      if (!('error' in setting)) setting.error = []
      if (!('hidden' in setting)) setting.hidden = []
      if (!('pluginDisable' in setting)) setting.pluginDisable = []
      if (!('receiver' in setting)) setting.receiver = []
      if (!('groupmode' in setting)) setting.groupmode = false
      if (!('sk_pack' in setting)) setting.sk_pack = 'Dibuat oleh'
      if (!('sk_author' in setting)) setting.sk_author = 'www.xinzuo.xyz'
      if (!('self' in setting)) setting.self = false
      if (!('noprefix' in setting)) setting.noprefix = false
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['.', '/', '!', '#']
      if (!('toxic' in setting)) setting.toxic = ["ajg", "ajig", "anjas", "anjg", "anjim", "anjing", "anjrot", "anying", "asw", "autis", "babi", "bacod", "bacot", "bagong", "bajingan", "bangsad", "bangsat", "bastard", "bego", "bgsd", "biadab", "biadap", "bitch", "bngst", "bodoh", "bokep", "cocote", "coli", "colmek", "comli", "dajjal", "dancok", "dongo", "fuck", "gelay", "goblog", "goblok", "guoblog", "guoblok", "hairul", "henceut", "idiot", "itil", "jamet", "jancok", "jembut", "jingan", "kafir", "kanjut", "kanyut", "keparat", "kntl", "kontol", "lana", "loli", "lont", "lonte", "mancing", "meki", "memek", "ngentod", "ngentot", "ngewe", "ngocok", "ngtd", "njeng", "njing", "njinx", "oppai", "pantek", "pantek", "peler", "pepek", "pilat", "pler", "pornhub", "pucek", "puki", "pukimak", "redhub", "sange", "setan", "silit", "telaso", "tempek", "tete", "titit", "toket", "tolol", "tomlol", "tytyd", "wildan", "xnxx"]
      if (!('online' in setting)) setting.online = true
      if (!('onlyprefix' in setting)) setting.onlyprefix = '+'
      if (!('owners' in setting)) setting.owners = ['6281391337455']
      if (!isNumber(setting.lastReset)) setting.lastReset = new Date * 1
      if (!('msg' in setting)) setting.msg = 'Hi +tag'
      if (!('sk' in setting)) setting.msg = 'tes'
      if (!isNumber(setting.style)) setting.style = 4
      if (!('cover' in setting)) setting.cover = ''
      if (!('link' in setting)) setting.link = ''
   } else {
      global.db.setting = {
         autodownload: true,
         antispam: false,
         debug: false,
         error: [],
         hidden: [],
         pluginDisable: [],
         receiver: [],
         groupmode: false,
         sk_pack: 'Dibuat oleh',
         sk_author: 'www.xinzuo.xyz',
         self: false,
         noprefix: false,
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         toxic: ["ajg", "ajig", "anjas", "anjg", "anjim", "anjing", "anjrot", "anying", "asw", "autis", "babi", "bacod", "bacot", "bagong", "bajingan", "bangsad", "bangsat", "bastard", "bego", "bgsd", "biadab", "biadap", "bitch", "bngst", "bodoh", "bokep", "cocote", "coli", "colmek", "comli", "dajjal", "dancok", "dongo", "fuck", "gelay", "goblog", "goblok", "guoblog", "guoblok", "hairul", "henceut", "idiot", "itil", "jamet", "jancok", "jembut", "jingan", "kafir", "kanjut", "kanyut", "keparat", "kntl", "kontol", "lana", "loli", "lont", "lonte", "mancing", "meki", "memek", "ngentod", "ngentot", "ngewe", "ngocok", "ngtd", "njeng", "njing", "njinx", "oppai", "pantek", "pantek", "peler", "pepek", "pilat", "pler", "pornhub", "pucek", "puki", "pukimak", "redhub", "sange", "setan", "silit", "telaso", "tempek", "tete", "titit", "toket", "tolol", "tomlol", "tytyd", "wildan", "xnxx"],
         online: true,
         onlyprefix: '+',
         owners: ['6281391337455'],
         lastReset: new Date * 1,
         msg: 'Hi +tag',
         sk: 'tes',
         style: 4,
         cover: '',
         link: ''
      }
   }
}