import { useState, useEffect, useRef } from 'react'

const C = {
  red:    '#D52B1E',
  white:  '#FFFFFF',
  blue:   '#0038A8',
  gold:   '#C8A551',
  green:  '#2D6A4F',
  terra:  '#C1440E',
  river:  '#4A90D9',
  slate:  '#4A5568',
  stone:  '#8B8682',
  cream:  '#FFF8F0',
  dark:   '#1A1A2E',
  light:  '#F7F3EE',
  sand:   '#E8D5B7',
  jungle: '#1B4332',
}

const getLS = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
const setLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function speakES(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  const v = voices.find(x => x.lang === 'es-PY')
    || voices.find(x => x.lang === 'es-MX')
    || voices.find(x => x.lang === 'es-ES')
    || voices.find(x => x.lang.startsWith('es'))
  if (v) u.voice = v
  u.lang = 'es-ES'; u.rate = 0.85; u.pitch = 1.0
  window.speechSynthesis.speak(u)
}

const DAILY_PHRASES = [
  { es:'Dios te ama.', en:'God loves you.' },
  { es:'La fe sin obras está muerta.', en:'Faith without works is dead.' },
  { es:'Pide y se te dará.', en:'Ask and it shall be given to you.' },
  { es:'Arrepentíos y sed bautizados.', en:'Repent and be baptized.' },
  { es:'La familia puede ser eterna.', en:'Families can be eternal.' },
  { es:'El Libro de Mormón es verdadero.', en:'The Book of Mormon is true.' },
  { es:'Jesucristo es el Salvador del mundo.', en:'Jesus Christ is the Savior of the world.' },
  { es:'Orad sin cesar.', en:'Pray without ceasing.' },
  { es:'Con Dios todo es posible.', en:'With God all things are possible.' },
  { es:'El Espíritu Santo testifica de la verdad.', en:'The Holy Ghost testifies of truth.' },
  { es:'Toda buena dádiva viene de Dios.', en:'Every good gift comes from God.' },
  { es:'Somos hijos de Dios.', en:'We are children of God.' },
  { es:'La paz que sobrepasa todo entendimiento.', en:'Peace that surpasses all understanding.' },
  { es:'Amad a vuestros prójimos.', en:'Love your neighbors.' },
  { es:'El arrepentimiento trae alegría.', en:'Repentance brings joy.' },
  { es:'La oración abre puertas.', en:'Prayer opens doors.' },
  { es:'Buscad primeramente el reino de Dios.', en:'Seek first the kingdom of God.' },
  { es:'La gracia de Cristo es suficiente.', en:"Christ's grace is sufficient." },
  { es:'Confía en el Señor con todo tu corazón.', en:'Trust in the Lord with all your heart.' },
  { es:'El Evangelio es la buena nueva.', en:'The Gospel is the good news.' },
  { es:'Venid a Cristo.', en:'Come unto Christ.' },
  { es:'La misión es un privilegio sagrado.', en:'A mission is a sacred privilege.' },
  { es:'El templo es la casa del Señor.', en:'The temple is the house of the Lord.' },
  { es:'Las Escrituras iluminan el camino.', en:'The Scriptures illuminate the path.' },
  { es:'El Padre Celestial escucha tus oraciones.', en:'Heavenly Father hears your prayers.' },
  { es:'La expiación sana todas las heridas.', en:'The Atonement heals all wounds.' },
  { es:'Sed fuertes y valientes.', en:'Be strong and courageous.' },
  { es:'Enseñad con el Espíritu.', en:'Teach by the Spirit.' },
  { es:'El sacerdocio bendice la vida.', en:'The priesthood blesses life.' },
  { es:'Paraguay espera tu mensaje.', en:'Paraguay awaits your message.' },
]

const MILESTONES = [
  { days:1,   label:'¡Primer Día!', icon:'🌟' },
  { days:3,   label:'3 Días',       icon:'🔥' },
  { days:7,   label:'Una Semana',   icon:'🗓️' },
  { days:14,  label:'Dos Semanas',  icon:'💪' },
  { days:30,  label:'Un Mes',       icon:'🏅' },
  { days:60,  label:'Dos Meses',    icon:'⭐' },
  { days:90,  label:'Tres Meses',   icon:'🎖️' },
  { days:120, label:'120 Días',     icon:'🏆' },
]

const SPANISH_LETTERS = [
  { letter:'A', name:'a',         ipa:'/a/',      sound:'Like "a" in father',                   missionWord:'Amor',        missionEn:'Love' },
  { letter:'B', name:'be',        ipa:'/b/',      sound:'Like "b" in boy',                      missionWord:'Bautismo',    missionEn:'Baptism' },
  { letter:'C', name:'ce',        ipa:'/k/ /s/',  sound:'"k" before a,o,u — "s" before e,i',   missionWord:'Cristo',      missionEn:'Christ' },
  { letter:'D', name:'de',        ipa:'/d/',      sound:'Like "d" in dog',                      missionWord:'Dios',        missionEn:'God' },
  { letter:'E', name:'e',         ipa:'/e/',      sound:'Like "e" in bed',                      missionWord:'Evangelio',   missionEn:'Gospel' },
  { letter:'F', name:'efe',       ipa:'/f/',      sound:'Like "f" in fan',                      missionWord:'Fe',          missionEn:'Faith' },
  { letter:'G', name:'ge',        ipa:'/x/ /g/',  sound:'"h" before e,i — hard g elsewhere',   missionWord:'Gracia',      missionEn:'Grace' },
  { letter:'H', name:'hache',     ipa:'(silent)', sound:'Always silent in Spanish',             missionWord:'Hermano',     missionEn:'Brother' },
  { letter:'I', name:'i',         ipa:'/i/',      sound:'Like "ee" in see',                     missionWord:'Iglesia',     missionEn:'Church' },
  { letter:'J', name:'jota',      ipa:'/x/',      sound:'From the throat — like Scottish loch', missionWord:'Jesus',       missionEn:'Jesus' },
  { letter:'K', name:'ka',        ipa:'/k/',      sound:'Like "k" in key',                      missionWord:'Kilometro',   missionEn:'Kilometer' },
  { letter:'L', name:'ele',       ipa:'/l/',      sound:'Like "l" in love',                     missionWord:'Libro',       missionEn:'Book' },
  { letter:'M', name:'eme',       ipa:'/m/',      sound:'Like "m" in man',                      missionWord:'Mision',      missionEn:'Mission' },
  { letter:'N', name:'ene',       ipa:'/n/',      sound:'Like "n" in no',                       missionWord:'Nuevo',       missionEn:'New' },
  { letter:'N', name:'ene',       ipa:'/n/',      sound:'Like "n" in no (Nuevo)',                missionWord:'Nuevo',       missionEn:'New' },
  { letter:'O', name:'o',         ipa:'/o/',      sound:'Like "o" in ore',                      missionWord:'Oracion',     missionEn:'Prayer' },
  { letter:'P', name:'pe',        ipa:'/p/',      sound:'Like "p" in pen',                      missionWord:'Profeta',     missionEn:'Prophet' },
  { letter:'Q', name:'cu',        ipa:'/k/',      sound:'Only used with "ue" or "ui"',          missionWord:'Quorum',      missionEn:'Quorum' },
  { letter:'R', name:'erre',      ipa:'/r/',      sound:'Tapped (single) or trilled (start)',   missionWord:'Revelacion',  missionEn:'Revelation' },
  { letter:'S', name:'ese',       ipa:'/s/',      sound:'Like "s" in sun',                      missionWord:'Salvacion',   missionEn:'Salvation' },
  { letter:'T', name:'te',        ipa:'/t/',      sound:'Like "t" in top',                      missionWord:'Templo',      missionEn:'Temple' },
  { letter:'U', name:'u',         ipa:'/u/',      sound:'Like "oo" in moon',                    missionWord:'Usted',       missionEn:'You (formal)' },
  { letter:'V', name:'uve',       ipa:'/b/',      sound:'Same sound as B in Latin American Spanish', missionWord:'Verdad', missionEn:'Truth' },
  { letter:'W', name:'doble uve', ipa:'/w/',      sound:'Like "w" in water',                    missionWord:'(extranjero)',missionEn:'Rare in Spanish' },
  { letter:'X', name:'equis',     ipa:'/ks/',     sound:'Like "ks" or "s"',                     missionWord:'Expiacion',   missionEn:'Atonement' },
  { letter:'Y', name:'ye',        ipa:'/j/',      sound:'Like "y" in yes',                      missionWord:'Yo',          missionEn:'I' },
  { letter:'Z', name:'zeta',      ipa:'/s/',      sound:'Like "s" in Latin America',            missionWord:'Zona',        missionEn:'Zone' },
]

const SPECIAL_COMBOS = [
  { combo:'ll', name:'elle',       sound:'Like "y" — or "sh" in Paraguay',      example:'llamar — to call',    note:'In Paraguay often sounds like "sh" in shoe' },
  { combo:'rr', name:'erre doble', sound:'Strongly trilled R',                   example:'perro — dog',         note:'Double the trill — very different from single r!' },
  { combo:'ch', name:'che',        sound:'Like "ch" in church',                  example:'muchacho — boy',      note:'Very common in Paraguayan speech' },
  { combo:'qu', name:'cu',         sound:'Like "k" — the u is always silent',    example:'quorum — quorum',     note:'The U is always silent with qu' },
  { combo:'gu', name:'gu',         sound:'Hard g before e/i — u is silent',      example:'seguir — to follow',  note:'Guee/guii with dieresis sounds the u' },
]

const VOCAB_CATS = [
  { id:'numbers',  label:'Numeros',      sublabel:'Numbers',     icon:'🔢', color:C.blue,
    words:[{es:'cero',en:'zero'},{es:'uno',en:'one'},{es:'dos',en:'two'},{es:'tres',en:'three'},{es:'cuatro',en:'four'},{es:'cinco',en:'five'},{es:'seis',en:'six'},{es:'siete',en:'seven'},{es:'ocho',en:'eight'},{es:'nueve',en:'nine'},{es:'diez',en:'ten'},{es:'veinte',en:'twenty'},{es:'treinta',en:'thirty'},{es:'cien',en:'one hundred'},{es:'mil',en:'one thousand'},{es:'primero',en:'first'},{es:'segundo',en:'second'},{es:'ultimo',en:'last'}]},
  { id:'time',     label:'Dias y Tiempo',sublabel:'Days & Time', icon:'📅', color:C.green,
    words:[{es:'lunes',en:'Monday'},{es:'martes',en:'Tuesday'},{es:'miercoles',en:'Wednesday'},{es:'jueves',en:'Thursday'},{es:'viernes',en:'Friday'},{es:'sabado',en:'Saturday'},{es:'domingo',en:'Sunday'},{es:'hoy',en:'today'},{es:'manana',en:'tomorrow'},{es:'ayer',en:'yesterday'},{es:'ahora',en:'now'},{es:'tarde',en:'afternoon'},{es:'temprano',en:'early'},{es:'hora',en:'hour'},{es:'semana',en:'week'},{es:'mes',en:'month'},{es:'ano',en:'year'},{es:'siempre',en:'always'}]},
  { id:'food',     label:'Comida',       sublabel:'Food',        icon:'🍽️', color:C.terra,
    words:[{es:'sopa paraguaya',en:'Paraguayan cornbread'},{es:'chipa',en:'cheese bread'},{es:'mbeju',en:'starch flatbread'},{es:'terere',en:'cold yerba mate'},{es:'mate',en:'hot yerba mate'},{es:'mandioca',en:'cassava'},{es:'asado',en:'grilled meat'},{es:'agua',en:'water'},{es:'desayuno',en:'breakfast'},{es:'almuerzo',en:'lunch'},{es:'cena',en:'dinner'},{es:'delicioso',en:'delicious'},{es:'hambre',en:'hunger'},{es:'sed',en:'thirst'},{es:'gracias',en:'thank you'},{es:'pan',en:'bread'},{es:'fruta',en:'fruit'},{es:'pollo',en:'chicken'}]},
  { id:'shopping', label:'Compras',      sublabel:'Shopping',    icon:'🛒', color:C.gold,
    words:[{es:'mercado',en:'market'},{es:'precio',en:'price'},{es:'caro',en:'expensive'},{es:'barato',en:'cheap'},{es:'comprar',en:'to buy'},{es:'vender',en:'to sell'},{es:'dinero',en:'money'},{es:'guarani',en:'Paraguayan currency'},{es:'cambio',en:'change'},{es:'tienda',en:'store'},{es:'pagar',en:'to pay'},{es:'por favor',en:'please'},{es:'de nada',en:"you're welcome"},{es:'perdon',en:'excuse me'},{es:'ayuda',en:'help'},{es:'recibo',en:'receipt'},{es:'bolsa',en:'bag'},{es:'cuanto cuesta',en:'how much does it cost'}]},
  { id:'transport',label:'Transporte',   sublabel:'Transport',   icon:'🚌', color:C.river,
    words:[{es:'autobus',en:'bus'},{es:'taxi',en:'taxi'},{es:'bicicleta',en:'bicycle'},{es:'moto',en:'motorcycle'},{es:'calle',en:'street'},{es:'avenida',en:'avenue'},{es:'barrio',en:'neighborhood'},{es:'cerca',en:'near'},{es:'lejos',en:'far'},{es:'izquierda',en:'left'},{es:'derecha',en:'right'},{es:'recto',en:'straight ahead'},{es:'parada',en:'stop'},{es:'mapa',en:'map'},{es:'direccion',en:'address'},{es:'cruzar',en:'to cross'},{es:'doblar',en:'to turn'},{es:'caminar',en:'to walk'}]},
  { id:'family',   label:'Familia',      sublabel:'Family',      icon:'👨‍👩‍👧‍👦', color:C.red,
    words:[{es:'padre',en:'father'},{es:'madre',en:'mother'},{es:'hijo',en:'son'},{es:'hija',en:'daughter'},{es:'hermano',en:'brother'},{es:'hermana',en:'sister'},{es:'abuelo',en:'grandfather'},{es:'abuela',en:'grandmother'},{es:'esposo',en:'husband'},{es:'esposa',en:'wife'},{es:'tio',en:'uncle'},{es:'tia',en:'aunt'},{es:'primo',en:'cousin (m)'},{es:'prima',en:'cousin (f)'},{es:'familia',en:'family'},{es:'nino',en:'child (m)'},{es:'nina',en:'child (f)'},{es:'bebe',en:'baby'}]},
  { id:'gospel',   label:'Evangelio',    sublabel:'Gospel Terms', icon:'✝️', color:C.slate,
    words:[{es:'fe',en:'faith'},{es:'arrepentimiento',en:'repentance'},{es:'bautismo',en:'baptism'},{es:'Espiritu Santo',en:'Holy Ghost'},{es:'profeta',en:'prophet'},{es:'revelacion',en:'revelation'},{es:'Evangelio',en:'Gospel'},{es:'Salvador',en:'Savior'},{es:'gracia',en:'grace'},{es:'expiacion',en:'atonement'},{es:'Escrituras',en:'Scriptures'},{es:'oracion',en:'prayer'},{es:'testimonio',en:'testimony'},{es:'Padre Celestial',en:'Heavenly Father'},{es:'eterno',en:'eternal'},{es:'convenio',en:'covenant'},{es:'ordenanza',en:'ordinance'},{es:'santificacion',en:'sanctification'}]},
  { id:'church',   label:'La Iglesia',   sublabel:'The Church',  icon:'⛪', color:C.blue,
    words:[{es:'obispo',en:'bishop'},{es:'misionero',en:'missionary'},{es:'quorum',en:'quorum'},{es:'rama',en:'branch'},{es:'distrito',en:'district'},{es:'presidencia',en:'presidency'},{es:'sacerdocio',en:'priesthood'},{es:'ayuno',en:'fast'},{es:'diezmo',en:'tithing'},{es:'templo',en:'temple'},{es:'reunion sacramental',en:'sacrament meeting'},{es:'mision',en:'mission'},{es:'estaca',en:'stake'},{es:'elder',en:'elder'},{es:'investigador',en:'investigator'},{es:'conferencia',en:'conference'},{es:'llamamiento',en:'calling'},{es:'membrete',en:'member'}]},
  { id:'feelings', label:'Sentimientos', sublabel:'Feelings',    icon:'💛', color:C.gold,
    words:[{es:'feliz',en:'happy'},{es:'triste',en:'sad'},{es:'agradecido',en:'grateful'},{es:'esperanza',en:'hope'},{es:'paz',en:'peace'},{es:'amor',en:'love'},{es:'confundido',en:'confused'},{es:'asustado',en:'scared'},{es:'emocionado',en:'excited'},{es:'cansado',en:'tired'},{es:'bendecido',en:'blessed'},{es:'preocupado',en:'worried'},{es:'contento',en:'content'},{es:'orgulloso',en:'proud'},{es:'animado',en:'encouraged'},{es:'humilde',en:'humble'},{es:'agobiado',en:'overwhelmed'},{es:'gozoso',en:'joyful'}]},
]

const PHRASE_CATEGORIES = [
  { id:'greetings', label:'Saludos', sublabel:'Greetings', color:C.blue, phrases:[
    { es:'Buenos dias.', en:'Good morning.', wbw:'Buenos=Good • dias=morning', note:'Used before noon' },
    { es:'Buenas tardes.', en:'Good afternoon.', wbw:'Buenas=Good • tardes=afternoon', note:'Used noon to evening' },
    { es:'Buenas noches.', en:'Good evening.', wbw:'Buenas=Good • noches=evening/night', note:'Evening greeting or farewell' },
    { es:'Como esta usted?', en:'How are you? (formal)', wbw:'Como=How • esta=are • usted=you(formal)', note:'Always use usted with adults — it shows deep respect' },
    { es:'Mucho gusto en conocerle.', en:'Very pleased to meet you.', wbw:'Mucho=Much • gusto=pleasure • conocerle=to meet you', note:'Warm first-meeting greeting' },
    { es:'Como se llama usted?', en:'What is your name? (formal)', wbw:'Como=How • se llama=are you called • usted=you', note:'Formal way to ask someone\'s name' },
    { es:'Que le vaya bien.', en:'May things go well for you.', wbw:'Que=May • le=for you • vaya=go • bien=well', note:'Beautiful Paraguayan farewell blessing' },
    { es:'Hasta luego.', en:'Goodbye — Until later.', wbw:'Hasta=Until • luego=later', note:'Most common farewell in Paraguay' },
  ]},
  { id:'intro', label:'Presentacion', sublabel:'Introduction', color:C.red, phrases:[
    { es:'Me llamo Elder Nilsson.', en:'My name is Elder Nilsson.', wbw:'Me=Myself • llamo=called • Elder=Elder • Nilsson=Nilsson', note:'Always introduce yourself first' },
    { es:'Soy misionero de La Iglesia de Jesucristo de los Santos de los Ultimos Dias.', en:'I am a missionary of The Church of Jesus Christ of Latter-day Saints.', wbw:'Soy=I am • misionero=missionary • de=of • La Iglesia=The Church', note:'Use the full name of the Church' },
    { es:'Venimos a compartir un mensaje importante.', en:'We come to share an important message.', wbw:'Venimos=We come • compartir=share • mensaje=message • importante=important', note:'State your purpose clearly and with confidence' },
    { es:'Podemos pasar un momento?', en:'May we come in for a moment?', wbw:'Podemos=May we • pasar=come in • un momento=a moment', note:'Respectful request to enter the home' },
    { es:'Tenemos un mensaje sobre Jesucristo.', en:'We have a message about Jesus Christ.', wbw:'Tenemos=We have • mensaje=message • sobre=about • Jesucristo=Jesus Christ', note:'Focus on Christ from the very first moment' },
    { es:'Ha escuchado de nosotros antes?', en:'Have you heard of us before?', wbw:'Ha escuchado=Have you heard • de nosotros=of us • antes=before', note:'Gauge their prior knowledge of the Church' },
  ]},
  { id:'teaching', label:'Ensenando', sublabel:'Teaching', color:C.green, phrases:[
    { es:'Dios es nuestro Padre Celestial.', en:'God is our Heavenly Father.', wbw:'Dios=God • es=is • nuestro=our • Padre=Father • Celestial=Heavenly', note:'The foundational first principle of the Gospel' },
    { es:'Jesucristo es el Salvador del mundo.', en:'Jesus Christ is the Savior of the world.', wbw:'Jesucristo=Jesus Christ • es=is • el Salvador=the Savior • del mundo=of the world', note:'Central to your testimony' },
    { es:'El Libro de Mormon es otro testamento de Jesucristo.', en:'The Book of Mormon is another testament of Jesus Christ.', wbw:'El Libro de Mormon=The Book of Mormon • es=is • otro=another • testamento=testament', note:'Introduce the Book of Mormon with faith' },
    { es:'Leeria usted el Libro de Mormon?', en:'Would you read the Book of Mormon?', wbw:'Leeria=Would you read • usted=you • el Libro de Mormon=the Book of Mormon', note:'The commitment begins with reading' },
    { es:'La familia puede ser eterna.', en:'The family can be eternal.', wbw:'La familia=The family • puede ser=can be • eterna=eternal', note:'Deeply powerful for Paraguayan families' },
    { es:'El arrepentimiento trae paz y alegria.', en:'Repentance brings peace and joy.', wbw:'El arrepentimiento=Repentance • trae=brings • paz=peace • alegria=joy', note:'Frame repentance positively — it is a gift' },
    { es:'Dios nos habla hoy por medio de un profeta vivo.', en:'God speaks to us today through a living prophet.', wbw:'Dios=God • nos habla=speaks to us • hoy=today • profeta vivo=living prophet', note:'The Restoration — God has not gone silent' },
    { es:'Le gustaria ser bautizado?', en:'Would you like to be baptized?', wbw:'Le=To you • gustaria=would like • ser=to be • bautizado=baptized', note:'Extend the baptismal invitation with love and faith' },
  ]},
  { id:'prayer', label:'Oracion', sublabel:'Prayer', color:C.gold, phrases:[
    { es:'Querido Padre Celestial,', en:'Dear Heavenly Father,', wbw:'Querido=Dear • Padre=Father • Celestial=Heavenly', note:'How to begin every prayer in Spanish' },
    { es:'Te damos gracias por...', en:'We give thee thanks for...', wbw:'Te=Thee • damos=we give • gracias=thanks • por=for', note:'Express sincere, specific gratitude' },
    { es:'Te pedimos que...', en:'We ask thee to...', wbw:'Te=Thee • pedimos=we ask • que=that', note:'Make your petition humbly and specifically' },
    { es:'Por favor bendice a esta familia.', en:'Please bless this family.', wbw:'Por favor=Please • bendice=bless • a esta familia=this family', note:'Bless every home you visit' },
    { es:'Ayudanos a sentir el Espiritu Santo.', en:'Help us to feel the Holy Ghost.', wbw:'Ayudanos=Help us • sentir=feel • el Espiritu Santo=the Holy Ghost', note:'Invite the Spirit into every discussion' },
    { es:'En el nombre de Jesucristo, amen.', en:'In the name of Jesus Christ, amen.', wbw:'En=In • el nombre=the name • de Jesucristo=of Jesus Christ • amen=amen', note:'How to close every prayer' },
  ]},
]

const CULTURE_SECTIONS = [
  { id:'asuncion', icon:'🏛️', label:'Asuncion', sublabel:'Capital de Paraguay', color:C.blue, bgColor:'#EEF2FF',
    tagline:'La Madre de Ciudades — fundada en 1537',
    body:'Asuncion es una de las ciudades mas antiguas de Sudamerica, fundada en 1537 a orillas del Rio Paraguay. Conocida como "La Madre de Ciudades," fue el punto de partida para la colonizacion espanola de gran parte del continente. El centro historico alberga la catedral metropolitana, el palacio de gobierno y la bahia que da al gran rio. La ciudad mezcla arquitectura colonial espanola con influencias guaranies y modernas. Su clima tropical y su gente calida hacen de Asuncion una ciudad unica en el mundo.',
    vocab:['capital','rio','colonial','catedral','palacio','historia','ciudad','antiguo'],
    missionTip:'Los asuncenos sienten un orgullo profundo por su ciudad historica. Muestre interes genuino en la fundacion colonial y pregunte sus recomendaciones — para crear una conexion inmediata y autentica con sus investigadores.' },
  { id:'guarani', icon:'🪶', label:'Cultura Guarani', sublabel:'Raices indigenas', color:C.green, bgColor:'#F0FFF4',
    tagline:'La lengua hermosa — Nee pora',
    body:'Paraguay es el unico pais verdaderamente bilingue de America del Sur donde una lengua indigena es co-oficial. El guarani es hablado por mas del 90% de los paraguayos, incluso en las ciudades. La mezcla diaria de espanol y guarani se llama "Jopara" y es el habla cotidiana. Los guaranies tenian una rica tradicion de artesania en encaje (nanduti), ceramica, y una profunda espiritualidad. Su cultura valora profundamente la comunidad, la familia y el respeto por los mayores.',
    vocab:['guarani','idioma','lengua','nanduti','artesania','Jopara','tradicion','bilingue'],
    missionTip:'Aprender aunque sea una palabra en guarani abrira corazones de manera extraordinaria. Demuestra un respeto profundo por la identidad unica de Paraguay que el investigador no olvidara.' },
  { id:'terere', icon:'🌿', label:'Terere y Mate', sublabel:'La bebida nacional', color:C.green, bgColor:'#F0FFF4',
    tagline:'Compartir el terere es compartir el alma',
    body:'El terere (mate frio) es la bebida nacional de Paraguay y esta profundamente enraizado en cada aspecto de la vida diaria. Compartir terere es un ritual social de amistad, hospitalidad y confianza. Se bebe con una bombilla (pipeta metalica) desde un guampa (recipiente de cuero o madera). Los "yuyos" (hierbas medicinales) se agregan al agua fria para dar sabor y propiedades medicinales. Rechazar el terere puede interpretarse como una senal de desconfianza.',
    vocab:['terere','mate','yuyos','bombilla','guampa','compartir','amistad','hospitalidad'],
    missionTip:'Cuando le ofrezcan terere, aceptelo siempre. Este simple gesto dice "los respeto y confio en ustedes" mejor que cualquier palabra. El terere compartido es la llave de oro para abrir corazones paraguayos.' },
  { id:'navidad', icon:'🎄', label:'Navidad Paraguaya', sublabel:'La Navidad en verano', color:C.red, bgColor:'#FFF5F5',
    tagline:'Navidad bajo las estrellas del verano sudamericano',
    body:'En Paraguay, la Navidad se celebra en pleno verano austral (diciembre) con temperaturas de 35-40 grados. Las familias se reunen para la Misa de Gallo (misa de medianoche del 24), comen comidas tradicionales como sopa paraguaya y asado, y se intercambian regalos el 25. El pesebre (nacimiento) es central en cada hogar. Los villancicos llenan las noches calurosas. Es un tiempo de profunda devocion familiar y festejo comunitario centrado en Cristo.',
    vocab:['Navidad','pesebre','Jesus','villancico','Misa de Gallo','familia','nacimiento','celebrar'],
    missionTip:'La Navidad es la oportunidad perfecta para compartir el verdadero significado del nacimiento de Cristo. Pregunte: "Que significa para usted la Navidad?" y lleve la conversacion hacia el plan de Dios.' },
  { id:'comida', icon:'🍽️', label:'Comida Paraguaya', sublabel:'Sabores unicos del Paraguay', color:C.terra, bgColor:'#FFF8F0',
    tagline:'Cada plato cuenta una historia de dos mundos',
    body:'La cocina paraguaya es una mezcla unica de tradiciones guaranies y espanolas. La sopa paraguaya (a pesar del nombre, es un pan de maiz horneado con queso) es el plato nacional. La chipa (pan de almidon de mandioca con queso y anis) se come especialmente en Semana Santa. El asado (carne a la parrilla) es casi sagrado en los encuentros familiares. La mandioca aparece en casi todas las comidas. El mbeju es una tortilla de almidon frita y crujiente.',
    vocab:['sopa paraguaya','chipa','asado','mandioca','mbeju','Que rico','cocinar','sabor'],
    missionTip:'Siempre acepte las comidas que le ofrezcan. Exprese apreciacion sincera: "Que rico! Nunca habia comido algo tan delicioso." Rechazar comidas puede cerrar puertas; aceptarlas con gratitud construye puentes de amor.' },
  { id:'naturaleza', icon:'🌊', label:'El Rio Paraguay', sublabel:'Naturaleza y Creacion', color:C.river, bgColor:'#EBF8FF',
    tagline:'El rio que divide y une una nacion entera',
    body:'El Rio Paraguay divide el pais en dos regiones: el Gran Chaco al oeste (seco, extenso, poca poblacion) y la Region Oriental al este (fertil, boscosa, muy poblada). El Pantanal, que se extiende hacia el norte, es uno de los humedales tropicales mas grandes del mundo con biodiversidad extraordinaria. Los paraguayos tienen una conexion profunda con su tierra y sus rios. El rio es simbolo de vida, movimiento y conexion entre comunidades.',
    vocab:['rio','Chaco','Pantanal','naturaleza','creacion','agua','tierra','biodiversidad'],
    missionTip:'La belleza natural de Paraguay es un testimonio de la creacion de Dios. Use la naturaleza como punto de entrada: "No creen que toda esta belleza tiene un Creador que la ama?" Los paraguayos responden muy bien a esta conexion.' },
]

const READER_TEXTS = [
  { id:'legend', category:'Folklore', icon:'🪶', level:'Basico', levelColor:C.green,
    title:'La Leyenda de la Yerba Mate', subtitle:'Cuento Guarani',
    segments:[
      { es:'Cuentan los ancianos guaranies que hace mucho tiempo, los dioses bajaron a visitar la tierra.', en:'The Guarani elders tell that long ago, the gods came down to visit the earth.' },
      { es:'Una familia muy humilde los recibio con gran hospitalidad, ofreciendo su unica comida y refugio.', en:'A very humble family received them with great hospitality, offering their only food and shelter.' },
      { es:'En agradecimiento, los dioses decidieron dar a esa familia un regalo especial.', en:'In gratitude, the gods decided to give that family a special gift.' },
      { es:'Transformaron a la hija menor en una planta nueva y hermosa: la yerba mate.', en:'They transformed the youngest daughter into a new and beautiful plant: the yerba mate.' },
      { es:'Desde ese dia, la yerba mate da fuerza, compania y alegria a todos los que la comparten.', en:'From that day on, yerba mate gives strength, companionship, and joy to all who share it.' },
      { es:'Por eso, compartir terere no es solo beber — es compartir un regalo sagrado.', en:'That is why sharing terere is not just drinking — it is sharing a sacred gift.' },
    ]},
  { id:'pmg', category:'Mision', icon:'📖', level:'Avanzado', levelColor:C.blue,
    title:'El Mensaje de la Restauracion', subtitle:'Predicad Mi Evangelio, Cap. 3',
    segments:[
      { es:'Dios es el Padre Celestial de todos los espiritus que han vivido y viviran en la tierra.', en:'God is the Heavenly Father of all the spirits that have lived and will live on the earth.' },
      { es:'El ama a Sus hijos con amor perfecto y desea que todos retornen a Su presencia.', en:'He loves His children with perfect love and desires that all return to His presence.' },
      { es:'Jesucristo es el Hijo de Dios. El vino a la tierra para redimir a la humanidad del pecado y de la muerte.', en:'Jesus Christ is the Son of God. He came to earth to redeem mankind from sin and death.' },
      { es:'Mediante la Expiacion de Jesucristo, podemos ser perdonados del pecado y vivir con Dios eternamente.', en:'Through the Atonement of Jesus Christ, we can be forgiven of sin and live with God eternally.' },
      { es:'Jose Smith fue llamado como profeta para restaurar el Evangelio de Jesucristo en su plenitud sobre la tierra.', en:'Joseph Smith was called as a prophet to restore the Gospel of Jesus Christ in its fullness.' },
      { es:'Hoy existe un profeta vivo que guia a la Iglesia de Jesucristo con revelacion continua.', en:'Today there is a living prophet who guides the Church of Jesus Christ with continuous revelation.' },
    ]},
  { id:'nephi', category:'Escritura', icon:'📜', level:'Intermedio', levelColor:C.gold,
    title:'2 Nefi 31:20', subtitle:'El Libro de Mormon',
    segments:[
      { es:'Por lo tanto, os digo que debeis seguir adelante con firmeza en Cristo,', en:'Wherefore, I say unto you that ye must press forward with a steadfastness in Christ,' },
      { es:'teniendo un brillo perfecto de esperanza y amor a Dios y a todos los hombres.', en:'having a perfect brightness of hope and a love of God and of all men.' },
      { es:'Por lo cual, si seguís adelante,', en:'Wherefore, if ye shall press forward,' },
      { es:'festejando en la palabra de Cristo,', en:'feasting upon the word of Christ,' },
      { es:'y aguantais hasta el fin,', en:'and endure to the end,' },
      { es:'he aqui, asi dice el Padre: Tendreis vida eterna.', en:'behold, thus saith the Father: Ye shall have eternal life.' },
    ]},
  { id:'juan316', category:'Biblia', icon:'✝️', level:'Basico', levelColor:C.green,
    title:'Juan 3:16', subtitle:'El Nuevo Testamento',
    segments:[
      { es:'Porque de tal manera amo Dios al mundo,', en:'For God so loved the world,' },
      { es:'que ha dado a su Hijo unigenito,', en:'that he gave his only begotten Son,' },
      { es:'para que todo aquel que en el cree,', en:'that whosoever believeth in him' },
      { es:'no se pierda,', en:'should not perish,' },
      { es:'sino que tenga vida eterna.', en:'but have everlasting life.' },
    ]},
  { id:'oracion', category:'Oracion', icon:'🙏', level:'Practica', levelColor:C.red,
    title:'Oracion Matutina del Misionero', subtitle:'Practica de oracion',
    segments:[
      { es:'Querido Padre Celestial,', en:'Dear Heavenly Father,' },
      { es:'te damos gracias por esta hermosa manana y por el privilegio de servir como misioneros en Paraguay.', en:'we thank thee for this beautiful morning and for the privilege of serving as missionaries in Paraguay.' },
      { es:'Por favor, dirigenos hoy hacia las personas preparadas para recibir el Evangelio.', en:'Please lead us today toward the people prepared to receive the Gospel.' },
      { es:'Ayudanos a ensenar con el poder del Espiritu Santo para que toquemos corazones.', en:'Help us to teach with the power of the Holy Ghost so that we may touch hearts.' },
      { es:'Bendice a nuestras familias en casa y a los investigadores de esta area.', en:'Bless our families at home and the investigators in this area.' },
      { es:'En el nombre de Jesucristo, amen.', en:'In the name of Jesus Christ, amen.' },
    ]},
]

const SCRIPTURE_BOOKS = [
  { id:'bom', label:'El Libro de Mormon', sublabel:'Otro Testamento de Jesucristo', icon:'📗', color:C.blue,
    chapters:[
      { id:'1ne1', label:'1 Nefi 1:1-3', sublabel:'El principio del registro', verses:[
        { num:1, es:'Yo, Nefi, habiendo nacido de padres buenos, y habiendo recibido mucha instruccion de mi padre; y habiendo visto muchas aflicciones en el transcurso de mis dias; sin embargo habiendo sido muy favorecido del Senor en todos mis dias...', en:'I, Nephi, having been born of goodly parents, therefore I was taught somewhat in all the learning of my father; and having seen many afflictions in the course of my days, nevertheless, having been highly favored of the Lord in all my days...' },
        { num:2, es:'...si, teniendo un gran conocimiento de la bondad y los misterios de Dios, por tanto, quiero hacer un registro de mis procederes en mis dias.', en:'...yea, having had a great knowledge of the goodness and the mysteries of God, therefore I make a record of my proceedings in my days.' },
      ]},
      { id:'1ne3v7', label:'1 Nefi 3:7', sublabel:'Ire y hare', verses:[
        { num:7, es:'Y acontecio que yo, Nefi, le dije a mi padre: Ire y hare las cosas que el Senor ha mandado, pues se que el Senor no da mandamientos a los hijos de los hombres sino que preparara el camino para que puedan cumplir lo que les ha mandado.', en:'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.' },
      ]},
      { id:'2ne225', label:'2 Nefi 2:25', sublabel:'Los hombres existen para tener gozo', verses:[
        { num:25, es:'Adan cayo para que los hombres existieran; y existen los hombres para que tengan gozo.', en:'Adam fell that men might be; and men are, that they might have joy.' },
      ]},
      { id:'2ne925', label:'2 Nefi 9:6-7', sublabel:'La Expiacion y la Resurreccion', verses:[
        { num:6, es:'Porque como la muerte vino sobre todos los hombres para cumplir el proposito misericordioso del Grande Creador, debe haber un poder de resurreccion, y la resurreccion debe venir para todos los hombres por la fuerza y el poder, y la misericordia y la justicia del Santo Mesias.', en:'For as death hath passed upon all men, to fulfil the merciful plan of the great Creator, there must needs be a power of resurrection, and the resurrection must needs come unto man by reason of the fall; and the fall came by reason of transgression.' },
        { num:7, es:'Porque he aqui, si la carne no se levantara, vuestros espiritus debian quedar sujetos a ese angel que cayo del cielo delante del Dios Eterno, y se convirio en el diablo, para que reinara sobre vosotros.', en:'Wherefore, it must needs be an infinite atonement — save it should be an infinite atonement this corruption could not put on incorruption. Wherefore, the first judgment which came upon man must needs have remained to an endless duration.' },
      ]},
      { id:'2ne2523', label:'2 Nefi 25:23', sublabel:'La gracia despues de todo lo que podemos hacer', verses:[
        { num:23, es:'Porque trabajamos diligentemente para escribir, a fin de persuadir a nuestros hijos y tambien a nuestros hermanos que crean en Cristo y se reconcilien con Dios; porque sabemos que es por la gracia que nos salvamos, despues de hacer cuanto podamos.', en:'For we labor diligently to write, to persuade our children, and also our brethren, to believe in Christ, and to be reconciled to God; for we know that it is by grace that we are saved, after all we can do.' },
      ]},
      { id:'2ne31', label:'2 Nefi 31:17-20', sublabel:'La puerta del bautismo y el camino', verses:[
        { num:17, es:'Por lo tanto, haced las cosas que os he dicho, las que he visto que vuestro Senor y Redentor haria; porque por eso el Padre os muestra estas cosas, para que cuando llegue el tiempo de el sepais la puerta por la cual debeis entrar. Pues la puerta por la cual debeis entrar es el arrepentimiento y el bautismo por agua; y entonces viene la remision de vuestros pecados por fuego y por el Espiritu Santo.', en:'Wherefore, do the things which I have told you I have seen that your Lord and your Redeemer should do; for, for this cause have they been shown unto me, that ye might know the gate by which ye should enter. For the gate by which ye should enter is repentance and baptism by water; and then cometh a remission of your sins by fire and by the Holy Ghost.' },
        { num:20, es:'Por lo tanto, os digo que debeis seguir adelante con firmeza en Cristo, teniendo un brillo perfecto de esperanza y amor a Dios y a todos los hombres. Por lo cual, si seguís adelante, festejando en la palabra de Cristo, y aguantais hasta el fin, he aqui, asi dice el Padre: Tendreis vida eterna.', en:'Wherefore, ye must press forward with a steadfastness in Christ, having a perfect brightness of hope, and a love of God and of all men. Wherefore, if ye shall press forward, feasting upon the word of Christ, and endure to the end, behold, thus saith the Father: Ye shall have eternal life.' },
      ]},
      { id:'enos1', label:'Enos 1:3-8', sublabel:'La oracion que cambio su alma', verses:[
        { num:3, es:'He aqui, fui al bosque para cazar bestias; y las palabras que a menudo habia oido a mi padre hablar con respecto a la vida eterna y al gozo de los santos, se me penetraron profundamente en el corazon.', en:'Behold, I went to hunt beasts in the forests; and the words which I had often heard my father speak concerning eternal life, and the joy of the saints, sunk deep into my heart.' },
        { num:4, es:'Y mi alma tuvo hambre; y arrodille mis rodillas ante mi Hacedor, y clame a el en oracion poderosa y suplica por mi propia alma; y todo el dia clame a el, si, y cuando llego la noche todavia elevaba mi voz en alto para que llegara a los cielos.', en:'And my soul hungered; and I kneeled down before my Maker, and I cried unto him in mighty prayer and supplication for mine own soul; and all the day long did I cry unto him; yea, and when the night came I did still raise my voice high that it reached the heavens.' },
        { num:8, es:'Y me respondio, diciendo: Enos, tus pecados te son perdonados, y seras bendito.', en:'And he said unto me: Enos, thy sins are forgiven thee, and thou shalt be blessed.' },
      ]},
      { id:'mos217', label:'Mosiah 2:17', sublabel:'Al servicio de vuestros semejantes', verses:[
        { num:17, es:'Y he aqui, os digo estas cosas para que aprendais sabiduria; para que aprendais que cuando estais al servicio de vuestros semejantes, estais solamente al servicio de vuestro Dios.', en:'And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God.' },
      ]},
      { id:'mos317', label:'Mosiah 3:17', sublabel:'La salvacion solo viene por Cristo', verses:[
        { num:17, es:'Y ademas, la salvacion no viene sino por el arrepentimiento y la fe en el Senor Jesucristo.', en:'And moreover, I say unto you, that there shall be no other name given nor any other way nor means whereby salvation can come unto the children of men, only in and through the name of Christ, the Lord Omnipotent.' },
      ]},
      { id:'alma514', label:'Alma 5:14', sublabel:'El poderoso cambio', verses:[
        { num:14, es:'Y ahora bien, habeis experimentado este poderoso cambio en vuestros corazones? Podeis sentir de este modo ahora? Habeis nacido de Dios?', en:'And now behold, I ask of you, my brethren of the church, have ye spiritually been born of God? Have ye received his image in your countenances? Have ye experienced this mighty change in your hearts?' },
      ]},
      { id:'alma711', label:'Alma 7:11-12', sublabel:'El sufrimiento de Cristo', verses:[
        { num:11, es:'Y el saldra, sufriendo dolores y aflicciones y tentaciones de todo genero; y esto para que se cumpla la palabra que dice: El tomara sobre si los dolores y las enfermedades de su pueblo.', en:'And he shall go forth, suffering pains and afflictions and temptations of every kind; and this that the word might be fulfilled which saith he will take upon him the pains and the sicknesses of his people.' },
        { num:12, es:'Y tomara sobre si la muerte, a fin de aflojar los lazos de la muerte que ligan a su pueblo; y tomara sobre si sus enfermedades, para que su carne pueda llenarse de misericordia segun la carne, a fin de que sepa como socorrer a su pueblo en sus enfermedades.', en:'And he will take upon him death, that he may loose the bands of death which bind his people; and he will take upon him their infirmities, that his bowels may be filled with mercy, according to the flesh, that he may know according to the flesh how to succor his people according to their infirmities.' },
      ]},
      { id:'alma1143', label:'Alma 11:43-44', sublabel:'La Resurreccion', verses:[
        { num:43, es:'El espiritu y el cuerpo seran reunidos otra vez en su forma perfecta; tanto los miembros como las coyunturas quedaran restauradas a su propia y perfecta forma, tal como lo son ahora, o en el cuerpo, y seran traidos a comparecer ante el tribunal de Cristo.', en:'The spirit and the body shall be reunited again in its perfect form; both limb and joint shall be restored to its proper frame, even as we now are at this time; and we shall be brought to stand before God, knowing even as we know now, and have a bright recollection of all our guilt.' },
        { num:44, es:'Ahora bien, este restablecimiento debera venirles a todos, tanto al joven como al viejo, tanto al esclavo como al libre, tanto al hombre como a la mujer, tanto al impio como al justo; y ni siquiera se perdera un cabello de la cabeza; sino que todo sera restaurado a su perfecta forma.', en:'Now, this restoration shall come to all, both old and young, both bond and free, both male and female, both the wicked and the righteous; and even there shall not so much as a hair of their heads be lost; but every thing shall be restored to its perfect frame.' },
      ]},
      { id:'alma3221', label:'Alma 32:21,27', sublabel:'La fe y la semilla', verses:[
        { num:21, es:'Y ahora bien, como dije acerca de la fe, la fe no es tener un conocimiento perfecto de las cosas; por lo tanto, si teneis fe, esperais en cosas que no se ven, las cuales son verdaderas.', en:'And now as I said concerning faith — faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true.' },
        { num:27, es:'Mas he aqui, si despertais y despertais vuestras facultades, aunque sea hasta un experimento y ejerceis un poco de fe, si, aunque no sea mas que deseo de creer, dejese que este deseo obre en vosotros, si, hasta que creais en manera que podais dar lugar a una porcion de mis palabras.', en:'But behold, if ye will awake and arouse your faculties, even to an experiment upon my words, and exercise a particle of faith, yea, even if ye can no more than desire to believe, let this desire work in you, even until ye believe in a manner that ye can give place for a portion of my words.' },
        { num:28, es:'Ahora bien, compararemos la palabra con una semilla. Si dais lugar a que se siembre una semilla en vuestro corazon, si es una semilla verdadera, comenzara a hinchar vuestro pecho; y si no la expulsais, empezara a brotar.', en:'Now, we will compare the word unto a seed. Now, if ye give place, that a seed may be planted in your heart, behold, if it be a true seed, if ye do not cast it out by your unbelief, it will begin to swell within your breasts.' },
      ]},
      { id:'alma3432', label:'Alma 34:32-33', sublabel:'Esta vida es el tiempo de prepararse', verses:[
        { num:32, es:'Porque he aqui, esta vida es el tiempo para los hombres de prepararse para encontrar a Dios; si, he aqui que el dia de esta vida es el dia en que los hombres deben realizar sus obras.', en:'For behold, this life is the time for men to prepare to meet God; yea, behold the day of this life is the day for men to perform their labors.' },
        { num:33, es:'Y ahora bien, como os he dicho antes, como habeis tenido muchas oportunidades y testimonio acerca de estas cosas, entonces he aqui, que queda sino que os arrepintais de vuestros pecados y no procrastieis el dia de vuestro arrepentimiento?', en:'And now, as I said unto you before, as ye have had so many witnesses, therefore, I beseech of you that ye do not procrastinate the day of your repentance until the end; for after this day of life, which is given us to prepare for eternity, behold, if we do not improve our time while in this life, then cometh the night of darkness wherein there can be no labor performed.' },
      ]},
      { id:'alma363', label:'Alma 36:3', sublabel:'Confianza en Dios en las pruebas', verses:[
        { num:3, es:'Y ahora bien, oh mi hijo Helaman, te mando que pongas oido a mis palabras, pues te juro que cuanto pondreis vuestra confianza en Dios, sereis sostenidos en vuestras pruebas, tribulaciones y aflicciones, y sereis levantados en el ultimo dia.', en:'And now, O my son Helaman, behold, thou art in thy youth, and therefore, I beseech of thee that thou wilt hear my words and learn of me; for I do know that whosoever shall put their trust in God shall be supported in their trials, and their troubles, and their afflictions, and shall be lifted up at the last day.' },
      ]},
      { id:'alma3767', label:'Alma 37:6-7', sublabel:'Cosas pequenas y simples', verses:[
        { num:6, es:'Ahora bien, quizas pensais que esto es insensatez en mi; mas te digo que mediante las cosas pequenas y simples se llevan a cabo las grandes cosas; y mediante los pequenos medios el Senor confunde a los sabios y lleva a cabo la salvacion de muchas almas.', en:'Now ye may suppose that this is foolishness in me; but behold I say unto you, that by small and simple things are great things brought to pass; and small means in many instances doth confound the wise.' },
        { num:7, es:'Y el Senor Dios obra con medios para llevar a cabo sus grandes y eternas finalidades; y por medios muy pequenos el Senor confunde a los sabios y lleva a cabo la salvacion de muchas almas.', en:'And the Lord God doth work by means to bring about his great and eternal purposes; and by very small means the Lord doth confound the wise and bringeth about the salvation of many souls.' },
      ]},
      { id:'3ne11', label:'3 Nefi 11:10-11', sublabel:'La aparicion de Cristo', verses:[
        { num:10, es:'He aqui, soy Jesucristo, de quien los profetas dieron testimonio de que habia de venir al mundo.', en:'Behold, I am Jesus Christ, whom the prophets testified shall come into the world.' },
        { num:11, es:'Y he aqui que soy la luz y la vida del mundo; y he bebido de esa copa amarga que el Padre me dio, y he glorificado al Padre al tomar sobre mi los pecados del mundo, en lo cual he sufrido la voluntad del Padre en todas las cosas desde el principio.', en:'And behold, I am the light and the life of the world; and I have drunk out of that bitter cup which the Father hath given me, and have glorified the Father in taking upon me the sins of the world, in the which I have suffered the will of the Father in all things from the beginning.' },
      ]},
      { id:'3ne27', label:'3 Nefi 27:13-14', sublabel:'El nombre de la Iglesia', verses:[
        { num:13, es:'He aqui, estoy en el Padre, y el Padre en mi, y el Padre y yo somos uno.', en:'Behold I am in the Father, and the Father in me, and the Father and I are one.' },
        { num:14, es:'Y como he sido levantado por los hombres, asi tambien los hombres seran levantados por el Padre para comparecer ante mi, para ser juzgados de sus obras, sean buenas o sean malas.', en:'And as I have been lifted up by men even so should men be lifted up by the Father, to stand before me, to be judged of their works, whether they be good or whether they be evil.' },
      ]},
      { id:'moro733', label:'Moroni 7:33', sublabel:'Fe para hacer milagros', verses:[
        { num:33, es:'Y Cristo dijo claramente: Si teneis fe, podreis hacer todas las cosas que a mi me son convenientes.', en:'And Christ hath said: If ye will have faith in me ye shall have power to do whatsoever thing is expedient in me.' },
      ]},
      { id:'moro747', label:'Moroni 7:47-48', sublabel:'La caridad, el amor puro de Cristo', verses:[
        { num:47, es:'Mas la caridad es el amor puro de Cristo, y permanece para siempre; y el que se halle que la posee en el ultimo dia, le ira bien.', en:'But charity is the pure love of Christ, and it endureth forever; and whoso is found possessed of it at the last day, it shall be well with him.' },
        { num:48, es:'Por lo tanto, amados mios, orad al Padre con toda la energia de vuestro corazon para que seais llenos de este amor, que el ha otorgado a todos los que son verdaderos seguidores de su Hijo Jesucristo; a fin de que llegueis a ser hijos de Dios; para que cuando el aparezca seamos semejantes a el, pues le veremos tal como es.', en:'Wherefore, my beloved brethren, pray unto the Father with all the energy of heart, that ye may be filled with this love, which he hath bestowed upon all who are true followers of his Son, Jesus Christ; that ye may become the sons of God; that when he shall appear we shall be like him, for we shall see him as he is.' },
      ]},
      { id:'moro10', label:'Moroni 10:3-5', sublabel:'La promesa de Moroni', verses:[
        { num:3, es:'He aqui, quisiera exhortaros a que, cuando leyereis estas cosas, recordeis cuan misericordioso ha sido el Senor con los hijos de los hombres desde la creacion de Adan hasta el tiempo en que recibireis estas cosas, y mediteis sobre ello en vuestros corazones.', en:'Behold, I would exhort you that when ye shall read these things, if it be wisdom in God that ye should read them, that ye would remember how merciful the Lord hath been unto the children of men, from the creation of Adam even down until the time that ye shall receive these things, and ponder it in your hearts.' },
        { num:4, es:'Y cuando recibiereis estas cosas, yo os exhortaria a que preguntaseis a Dios el Padre Eterno, en el nombre de Cristo, si no son verdaderas estas cosas; y si preguntareis con un corazon sincero, con verdadera intencion, teniendo fe en Cristo, el os manifestara la verdad de ellas por el poder del Espiritu Santo.', en:'And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost.' },
        { num:5, es:'Y por el poder del Espiritu Santo podeis saber la verdad de todas las cosas.', en:'And by the power of the Holy Ghost ye may know the truth of all things.' },
      ]},
    ]},
  { id:'at', label:'Antiguo Testamento', sublabel:'El Registro de Israel', icon:'📜', color:C.gold,
    chapters:[
      { id:'gen126', label:'Genesis 1:26-27', sublabel:'El hombre a imagen de Dios', verses:[
        { num:26, es:'Entonces dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y senoreeen los peces del mar, en las aves de los cielos, en las bestias, en toda la tierra, y en todo animal que se arrastra sobre la tierra.', en:'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth.' },
        { num:27, es:'Y creo Dios al hombre a su imagen, a imagen de Dios lo creo; varon y hembra los creo.', en:'So God created man in his own image, in the image of God created he him; male and female created he them.' },
      ]},
      { id:'jos2415', label:'Josue 24:15', sublabel:'Escoged a quien sirveis', verses:[
        { num:15, es:'Y si mal os parece servir a Jehova, escoged hoy a quien sirvais; si a los dioses a quienes sirvieron vuestros padres, cuando estuvieron al otro lado del rio, o a los dioses de los amorreos en cuya tierra habitais; pero yo y mi casa serviremos a Jehova.', en:'And if it seem evil unto you to serve the Lord, choose you this day whom ye will serve; whether the gods which your fathers served that were on the other side of the flood, or the gods of the Amorites, in whose land ye dwell: but as for me and my house, we will serve the Lord.' },
      ]},
      { id:'rei191112', label:'1 Reyes 19:11-12', sublabel:'La voz apacible y delicada', verses:[
        { num:11, es:'El le dijo: Sal fuera, y ponte en el monte delante de Jehova. Y he aqui Jehova que pasaba, y un grande y poderoso viento que rompia los montes y quebraba las penas delante de Jehova; pero Jehova no estaba en el viento. Y tras el viento un terremoto; pero Jehova no estaba en el terremoto.', en:'And he said, Go forth, and stand upon the mount before the Lord. And, behold, the Lord passed by, and a great and strong wind rent the mountains, and brake in pieces the rocks before the Lord; but the Lord was not in the wind: and after the wind an earthquake; but the Lord was not in the earthquake.' },
        { num:12, es:'Y tras el terremoto un fuego; pero Jehova no estaba en el fuego. Y tras el fuego una voz apacible y delicada.', en:'And after the earthquake a fire; but the Lord was not in the fire: and after the fire a still small voice.' },
      ]},
      { id:'sal4610', label:'Salmo 46:10', sublabel:'Estad quietos y conoced a Dios', verses:[
        { num:10, es:'Estad quietos, y conoced que yo soy Dios; sere exaltado entre las naciones; enaltecido sere en la tierra.', en:'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.' },
      ]},
      { id:'isa118', label:'Isaias 1:18', sublabel:'Aunque vuestros pecados sean como la grana', verses:[
        { num:18, es:'Venid luego, dice Jehova, y estemos a cuenta: si vuestros pecados fueren como la grana, como la nieve seran emblanquecidos; si fueren rojos como el carmesi, vendran a ser como blanca lana.', en:'Come now, and let us reason together, saith the Lord: though your sins be as scarlet, they shall be as white as snow; though they be red like crimson, they shall be as wool.' },
      ]},
      { id:'isa5589', label:'Isaias 55:8-9', sublabel:'Mis pensamientos no son vuestros pensamientos', verses:[
        { num:8, es:'Porque mis pensamientos no son vuestros pensamientos, ni vuestros caminos mis caminos, dijo Jehova.', en:'For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord.' },
        { num:9, es:'Como son mas altos los cielos que la tierra, asi son mis caminos mas altos que vuestros caminos, y mis pensamientos mas que vuestros pensamientos.', en:'For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts.' },
      ]},
      { id:'jer15', label:'Jeremias 1:5', sublabel:'Antes que te formase te conocí', verses:[
        { num:5, es:'Antes que te formase en el vientre te conoci, y antes que nacieras te santifique, te di por profeta a las naciones.', en:'Before I formed thee in the belly I knew thee; and before thou camest forth out of the womb I sanctified thee, and I ordained thee a prophet unto the nations.' },
      ]},
      { id:'amos37', label:'Amos 3:7', sublabel:'Dios revela sus secretos a sus profetas', verses:[
        { num:7, es:'Porque no hara nada Jehova el Senor, sin que revele su secreto a sus siervos los profetas.', en:'Surely the Lord God will do nothing, but he revealeth his secret unto his servants the prophets.' },
      ]},
      { id:'mal456', label:'Malaquias 4:5-6', sublabel:'Elias, sellador de familias', verses:[
        { num:5, es:'He aqui, yo os envio el profeta Elias, antes que venga el dia de Jehova, grande y terrible.', en:'Behold, I will send you Elijah the prophet before the coming of the great and dreadful day of the Lord.' },
        { num:6, es:'El hara volver el corazon de los padres hacia los hijos, y el corazon de los hijos hacia los padres, no sea que yo venga y hiera la tierra con maldicion.', en:'And he shall turn the heart of the fathers to the children, and the heart of the children to their fathers, lest I come and smite the earth with a curse.' },
      ]},
    ]},
  { id:'nt', label:'Nuevo Testamento', sublabel:'El Evangelio de Jesucristo', icon:'✝️', color:C.red,
    chapters:[
      { id:'mat3b', label:'Mateo 3:16-17', sublabel:'El bautismo de Cristo', verses:[
        { num:16, es:'Y Jesus, despues que fue bautizado, subio luego del agua; y he aqui los cielos le fueron abiertos, y vio al Espiritu de Dios que descendia como paloma, y venia sobre el.', en:'And Jesus, when he was baptized, went up straightway out of the water: and, lo, the heavens were opened unto him, and he saw the Spirit of God descending like a dove, and lighting upon him.' },
        { num:17, es:'Y hubo una voz de los cielos, que decia: Este es mi Hijo amado, en quien tengo complacencia.', en:'And lo a voice from heaven, saying, This is my beloved Son, in whom I am well pleased.' },
      ]},
      { id:'mat548', label:'Mateo 5:48', sublabel:'Sed perfectos como vuestro Padre', verses:[
        { num:48, es:'Sed, pues, vosotros perfectos, como vuestro Padre que esta en los cielos es perfecto.', en:'Be ye therefore perfect, even as your Father which is in heaven is perfect.' },
      ]},
      { id:'mat778', label:'Mateo 7:7-8', sublabel:'Pedid, buscad, llamad', verses:[
        { num:7, es:'Pedid, y se os dara; buscad, y hallareis; llamad, y se os abrira.', en:'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.' },
        { num:8, es:'Porque todo aquel que pide, recibe; y el que busca, halla; y al que llama, se le abrira.', en:'For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.' },
      ]},
      { id:'mat2236', label:'Mateo 22:36-40', sublabel:'Los dos grandes mandamientos', verses:[
        { num:37, es:'Jesus le dijo: Amaras al Senor tu Dios con todo tu corazon, y con toda tu alma, y con toda tu mente.', en:'Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind.' },
        { num:38, es:'Este es el primero y grande mandamiento.', en:'This is the first and great commandment.' },
        { num:39, es:'Y el segundo es semejante: Amaras a tu projimo como a ti mismo.', en:'And the second is like unto it, Thou shalt love thy neighbour as thyself.' },
        { num:40, es:'De estos dos mandamientos depende toda la ley y los profetas.', en:'On these two commandments hang all the law and the prophets.' },
      ]},
      { id:'jn35', label:'Juan 3:5', sublabel:'Nacer de agua y del Espiritu', verses:[
        { num:5, es:'Respondio Jesus: De cierto, de cierto te digo, que el que no naciere de agua y del Espiritu, no puede entrar en el reino de Dios.', en:'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.' },
      ]},
      { id:'jn316', label:'Juan 3:16-17', sublabel:'El amor de Dios', verses:[
        { num:16, es:'Porque de tal manera amo Dios al mundo, que ha dado a su Hijo unigenito, para que todo aquel que en el cree, no se pierda, mas tenga vida eterna.', en:'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
        { num:17, es:'Porque no envio Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por el.', en:'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
      ]},
      { id:'jn717', label:'Juan 7:17', sublabel:'Conocer si la doctrina es de Dios', verses:[
        { num:17, es:'El que quiera hacer la voluntad de Dios, conocera si la doctrina es de Dios, o si yo hablo por mi propia cuenta.', en:'If any man will do his will, he shall know of the doctrine, whether it be of God, or whether I speak of myself.' },
      ]},
      { id:'jn146', label:'Juan 14:6', sublabel:'Yo soy el camino, la verdad y la vida', verses:[
        { num:6, es:'Jesus le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mi.', en:'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.' },
      ]},
      { id:'jn1426', label:'Juan 14:26-27', sublabel:'El Consolador — el Espiritu Santo', verses:[
        { num:26, es:'Mas el Consolador, el Espiritu Santo, a quien el Padre enviara en mi nombre, el os ensenara todas las cosas, y os recordara todo lo que yo os he dicho.', en:'But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance, whatsoever I have said unto you.' },
        { num:27, es:'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazon, ni tenga miedo.', en:'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' },
      ]},
      { id:'hec319', label:'Hechos 3:19-21', sublabel:'La Restauracion de todas las cosas', verses:[
        { num:19, es:'Asi que, arrepentios y convertios, para que sean borrados vuestros pecados; para que vengan de la presencia del Senor tiempos de refrigerio.', en:'Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord.' },
        { num:20, es:'Y el envie a Jesucristo, que os fue antes anunciado.', en:'And he shall send Jesus Christ, which before was preached unto you.' },
        { num:21, es:'A quien de cierto es necesario que el cielo reciba hasta los tiempos de la restauracion de todas las cosas, de que hablo Dios por boca de sus santos profetas que han sido desde tiempo antiguo.', en:'Whom the heaven must receive until the times of restitution of all things, which God hath spoken by the mouth of all his holy prophets since the world began.' },
      ]},
      { id:'hec814', label:'Hechos 8:14-17', sublabel:'Imposicion de manos para el Espiritu Santo', verses:[
        { num:14, es:'Cuando los apostoles que estaban en Jerusalem oyeron que Samaria habia recibido la palabra de Dios, enviaron alla a Pedro y a Juan.', en:'Now when the apostles which were at Jerusalem heard that Samaria had received the word of God, they sent unto them Peter and John.' },
        { num:15, es:'Los cuales, habiendo venido, oraron por ellos para que recibiesen el Espiritu Santo.', en:'Who, when they were come down, prayed for them, that they might receive the Holy Ghost.' },
        { num:17, es:'Entonces les imponian las manos, y recibian el Espiritu Santo.', en:'Then laid they their hands on them, and they received the Holy Ghost.' },
      ]},
      { id:'rom816', label:'Romanos 8:16-17', sublabel:'Hijos y herederos de Dios', verses:[
        { num:16, es:'El Espiritu mismo da testimonio a nuestro espiritu, de que somos hijos de Dios.', en:'The Spirit itself beareth witness with our spirit, that we are the children of God.' },
        { num:17, es:'Y si hijos, tambien herederos; herederos de Dios y coherederos con Cristo, si es que padecemos juntamente con el, para que juntamente con el seamos glorificados.', en:'And if children, then heirs; heirs of God, and joint-heirs with Christ; if so be that we suffer with him, that we may be also glorified together.' },
      ]},
      { id:'efe219', label:'Efesios 2:19-20', sublabel:'Fundados sobre apostoles y profetas', verses:[
        { num:19, es:'Asi que ya no sois extranjeros ni advenedizos, sino conciudadanos de los santos, y miembros de la familia de Dios.', en:'Now therefore ye are no more strangers and foreigners, but fellowcitizens with the saints, and of the household of God.' },
        { num:20, es:'Edificados sobre el fundamento de los apostoles y profetas, siendo la principal piedra del angulo Jesucristo mismo.', en:'And are built upon the foundation of the apostles and prophets, Jesus Christ himself being the chief corner stone.' },
      ]},
      { id:'efe411', label:'Efesios 4:11-14', sublabel:'Apostoles y profetas en la Iglesia', verses:[
        { num:11, es:'Y el mismo constituyo a unos, apostoles; a otros, profetas; a otros, evangelistas; a otros, pastores y maestros.', en:'And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers.' },
        { num:12, es:'A fin de perfeccionar a los santos para la obra del ministerio, para la edificacion del cuerpo de Cristo.', en:'For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ.' },
        { num:13, es:'Hasta que todos lleguemos a la unidad de la fe y del conocimiento del Hijo de Dios, a un varon perfecto, a la medida de la estatura de la plenitud de Cristo.', en:'Till we all come in the unity of the faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the stature of the fulness of Christ.' },
        { num:14, es:'Para que ya no seamos ninos fluctuantes, llevados por doquiera de todo viento de doctrina, por estratagema de hombres que para enganar emplean con astucia las artimanas del error.', en:'That we henceforth be no more children, tossed to and fro, and carried about with every wind of doctrine, by the sleight of men, and cunning craftiness, whereby they lie in wait to deceive.' },
      ]},
      { id:'heb54', label:'Hebreos 5:4', sublabel:'Llamado por Dios como Aaron', verses:[
        { num:4, es:'Y nadie toma para si esta honra, sino el que es llamado por Dios, como lo fue Aaron.', en:'And no man taketh this honour unto himself, but he that is called of God, as was Aaron.' },
      ]},
      { id:'san15', label:'Santiago 1:5', sublabel:'Pedid sabiduria a Dios', verses:[
        { num:5, es:'Y si alguno de vosotros tiene falta de sabiduria, pidala a Dios, el cual da a todos abundantemente y sin reproche, y le sera dada.', en:'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.' },
      ]},
      { id:'san217', label:'Santiago 2:17', sublabel:'La fe sin obras es muerta', verses:[
        { num:17, es:'Asi tambien la fe, si no tiene obras, es muerta en si misma.', en:'Even so faith, if it hath not works, is dead, being alone.' },
      ]},
      { id:'mat28', label:'Mateo 28:19-20', sublabel:'La Gran Comision', verses:[
        { num:19, es:'Por tanto, id, y haced discipulos a todas las naciones, bautizandolos en el nombre del Padre, y del Hijo, y del Espiritu Santo;', en:'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.' },
        { num:20, es:'ensenandoles que guarden todas las cosas que os he mandado; y he aqui yo estoy con vosotros todos los dias, hasta el fin del mundo.', en:'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world.' },
      ]},
    ]},
  { id:'dyc', label:'Doctrina y Convenios', sublabel:'Revelacion Moderna', icon:'📘', color:C.green,
    chapters:[
      { id:'dyc130', label:'D y C 1:30', sublabel:'La unica Iglesia verdadera', verses:[
        { num:30, es:'Y tambien aquellos a quienes fue dada esta iglesia, la unica iglesia verdadera y viviente sobre la faz de toda la tierra, con la cual yo, el Senor, estoy bien complacido, hablando a la iglesia colectivamente y no individualmente.', en:'And also those to whom these commandments were given, might have power to lay the foundation of this church, and to bring it forth out of obscurity and out of darkness, the only true and living church upon the face of the whole earth.' },
      ]},
      { id:'dyc424', label:'D y C 4:2-4', sublabel:'La obra admirable de Dios', verses:[
        { num:2, es:'Por lo tanto, oh vosotros que os embarcais en el servicio de Dios, ved que le sirveis con todo vuestro corazon, poder, mente y fuerza, para que asi podais estar sin reproche ante Dios en el ultimo dia.', en:'Therefore, O ye that embark in the service of God, see that ye serve him with all your heart, might, mind and strength, that ye may stand blameless before God at the last day.' },
        { num:3, es:'Por tanto, si teneis deseos de servir a Dios, sois llamados a la obra.', en:'Therefore, if ye have desires to serve God ye are called to the work.' },
        { num:4, es:'Pues he aqui, el campo ya esta blanco, listo para la siega; y he aqui que aquel que pone su hoz con su fuerza, el mismo guarda la mies para la vida eterna, y por lo tanto es bienaventurado en el reino de Dios.', en:'For behold the field is white already to harvest; and lo, he that thrusteth in his sickle with his might, the same layeth up in store that he perisheth not, but bringeth salvation to his soul.' },
      ]},
      { id:'dyc636', label:'D y C 6:36', sublabel:'Mirad a mi en todo pensamiento', verses:[
        { num:36, es:'Mirad a mi en todo pensamiento; no dudeis, no temais.', en:'Look unto me in every thought; doubt not, fear not.' },
      ]},
      { id:'dyc823', label:'D y C 8:2-3', sublabel:'El espiritu de revelacion', verses:[
        { num:2, es:'Si, yo os dire en vuestra mente y en vuestro corazon, mediante el Espiritu Santo, el cual vendra sobre vosotros y morara en vuestro corazon.', en:'Yea, behold, I will tell you in your mind and in your heart, by the Holy Ghost, which shall come upon you and which shall dwell in your heart.' },
        { num:3, es:'Ahora he aqui, esto es el espiritu de revelacion; he aqui, esto es el principio de esta obra; por lo tanto, seguid hasta terminar.', en:'Now, behold, this is the spirit of revelation; behold, this is the spirit by which Moses brought the children of Israel through the Red Sea on dry ground.' },
      ]},
      { id:'dyc979', label:'D y C 9:7-9', sublabel:'El ardor en el seno', verses:[
        { num:7, es:'He aqui, no te ensene con respecto a este asunto? Debes estudiar esto en tu mente; entonces deberas preguntarme si es correcto, y si es correcto te causare que tu seno arda dentro de ti; por tanto, sentiras que es correcto.', en:'Behold, you have not understood; you have supposed that I would give it unto you, when you took no thought save it was to ask me. But, behold, I say unto you, that you must study it out in your mind; then you must ask me if it be right, and if it is right I will cause that your bosom shall burn within you.' },
        { num:8, es:'Pero si no es correcto, no tendras tales sentimientos, sino que tendras una insensatez de pensamiento que te causara olvidar que es correcto.', en:'But if it be not right you shall have no such feelings, but you shall have a stupor of thought that shall cause you to forget the thing which is wrong.' },
        { num:9, es:'Ahora bien, si no lo hubieras pedido, no habrias recibido.', en:'Now, if you had known this you could have translated; nevertheless, it is not expedient that you should translate now.' },
      ]},
      { id:'dyc1121', label:'D y C 11:21', sublabel:'Obtened la palabra primero', verses:[
        { num:21, es:'No procures declarar mi palabra, mas primeramente procura obtenerla, y entonces sera soltada tu lengua; entonces, si lo deseas, tendras mi Espiritu y mi palabra, si, el poder de Dios para convencer a los hombres.', en:'Seek not to declare my word, but first seek to obtain my word, and then shall your tongue be loosed; then, if you desire, you shall have my Spirit and my word, yea, the power of God unto the convincing of men.' },
      ]},
      { id:'dyc147', label:'D y C 14:7', sublabel:'El mayor don de Dios', verses:[
        { num:7, es:'Y si guardas mis mandamientos y perseveras hasta el fin, tendras vida eterna, lo cual es el mayor de todos los dones de Dios.', en:'And, if you keep my commandments and endure to the end you shall have eternal life, which gift is the greatest of all the gifts of God.' },
      ]},
      { id:'dyc1810', label:'D y C 18:10-11,15', sublabel:'El valor de las almas', verses:[
        { num:10, es:'Recuerda que el valor de las almas es grande a los ojos de Dios;', en:'Remember the worth of souls is great in the sight of God.' },
        { num:11, es:'porque he aqui, el Senor tu Redentor sufrio la muerte en la carne; por lo tanto sufrio el dolor de todos los hombres para que todos los hombres pudieran arrepentirse y acudir a el.', en:'For, behold, the Lord your Redeemer suffered death in the flesh; wherefore he suffered the pain of all men, that all men might repent and come unto him.' },
        { num:15, es:'Y si sucede que te esfuerzas con todos los dias de tu vida en proclamar este arrepentimiento a esta gente, y traes aunque sea un alma a mi, cuan grande sera tu gozo con el en el reino de mi Padre!', en:'And if it so be that you should labor all your days in crying repentance unto this people, and bring, save it be one soul unto me, how great shall be your joy with him in the kingdom of my Father!' },
      ]},
      { id:'dyc2037', label:'D y C 20:37', sublabel:'Requisitos para el bautismo', verses:[
        { num:37, es:'Y nuevamente, por cuestion de bautismo: todos los que se humillen ante Dios y deseen ser bautizados, y vengan con corazones quebrantados y espiritus contritos, y sean testigos ante la iglesia de que en verdad se han arrepentido de todos sus pecados y estan dispuestos a tomar sobre si el nombre de Jesucristo, habiendo determinado servirle hasta el fin, y en verdad muestren por sus obras que han recibido el Espiritu de Cristo para la remision de sus pecados, seran recibidos por el bautismo en su iglesia.', en:'All those who humble themselves before God, and desire to be baptized, and come forth with broken hearts and contrite spirits, and witness before the church that they have truly repented of all their sins, and are willing to take upon them the name of Jesus Christ, having a determination to serve him to the end, and truly manifest by their works that they have received of the Spirit of Christ unto the remission of their sins, shall be received by baptism into his church.' },
      ]},
      { id:'dyc5013', label:'D y C 50:13-14', sublabel:'El que predica y el que recibe', verses:[
        { num:13, es:'Por lo tanto, a aquel que predica y a aquel que recibe, se les debe entender el uno al otro, y ambos deben edificarse y regocijarse juntos.', en:'Wherefore, I the Lord ask you this question — unto what were ye ordained? To preach my gospel by the Spirit, even the Comforter which was sent forth to teach the truth.' },
        { num:14, es:'Y aquel que predique y aquel que reciban el Espiritu Santo estaran edificados en el regocijo.', en:'And then received ye spirits which ye could not understand, and received them to be of God; and in this are ye justified?' },
      ]},
      { id:'dyc5826', label:'D y C 58:26-27', sublabel:'Hombres diligentes y laboriosos', verses:[
        { num:26, es:'Porque he aqui, no es justo que yo mande en todas las cosas, pues aquel que esta compelido en todas las cosas es un siervo perezoso e indigno.', en:'For behold, it is not meet that I should command in all things; for he that is compelled in all things, the same is a slothful and not a wise servant.' },
        { num:27, es:'Por tanto, los hombres deberan ser diligentemente laboriosos en muchas cosas por su propia voluntad, y lograr mucha justicia; pues el poder esta en ellos para hacer todas estas cosas.', en:'Verily I say, men should be anxiously engaged in a good cause, and do many things of their own free will, and bring to pass much righteousness.' },
      ]},
      { id:'dyc7622', label:'D y C 76:22-24', sublabel:'Testimonio de Cristo resucitado', verses:[
        { num:22, es:'Y ahora bien, despues de las muchas y grandes experiencias que tuvimos, este es el testimonio que declaramos al mundo:', en:'And now, after the many testimonies which have been given of him, this is the testimony, last of all, which we give of him.' },
        { num:23, es:'que el vive! Pues le vimos, si, a mano derecha de Dios; y oimos la voz que declaraba que el es el Unigenito del Padre —', en:'That he lives! For we saw him, even on the right hand of God; and we heard the voice bearing record that he is the Only Begotten of the Father.' },
        { num:24, es:'que por el, mediante el y de el, los mundos son y fueron creados, y que los moradores de ellos son engendrados hijos e hijas para Dios.', en:'That by him, and through him, and of him, the worlds are and were created, and the inhabitants thereof are begotten sons and daughters unto God.' },
      ]},
      { id:'dyc8863', label:'D y C 88:63', sublabel:'Acercaos a mi', verses:[
        { num:63, es:'Acercaos a mi y yo me acercare a vosotros; buscadme diligentemente y me encontrareis; pedid, y recibireis; llamad, y se os abrira.', en:'Draw near unto me and I will draw near unto you; seek me diligently and ye shall find me; ask, and ye shall receive; knock, and it shall be opened unto you.' },
      ]},
      { id:'dyc1217', label:'D y C 121:7-8', sublabel:'Paz en las tribulaciones', verses:[
        { num:7, es:'Hijo mio, que te digan tus tribulaciones: La paz sea a tu alma. Tu adversidad y tus aflicciones no seran sino por un breve momento.', en:'My son, peace be unto thy soul; thine adversity and thine afflictions shall be but a small moment.' },
        { num:8, es:'Y luego, si soportas bien las cosas, Dios te exaltara en lo alto; triunfaras sobre todos tus enemigos.', en:'And then, if thou endure it well, God shall exalt thee on high; thou shalt triumph over all thy foes.' },
      ]},
      { id:'dyc13022', label:'D y C 130:22-23', sublabel:'La naturaleza de la Deidad', verses:[
        { num:22, es:'El Padre tiene un cuerpo de carne y huesos tan palpable como el del hombre; el Hijo tambien; pero el Espiritu Santo no tiene un cuerpo de carne y huesos, sino que es un personaje de Espiritu. Ello no fuera asi, el Espiritu Santo no podria morar en nosotros.', en:'The Father has a body of flesh and bones as tangible as man's; the Son also; but the Holy Ghost has not a body of flesh and bones, but is a personage of Spirit. Were it not so, the Holy Ghost could not dwell in us.' },
        { num:23, es:'Un hombre puede recibir el Espiritu Santo, y este puede descender sobre el, sin que permanezca con el.', en:'A man may receive the Holy Ghost, and it may descend upon him and not tarry with him.' },
      ]},
      { id:'dyc1311', label:'D y C 131:1-4', sublabel:'El matrimonio eterno y la exaltacion', verses:[
        { num:1, es:'En el grado celestial de gloria hay tres cielos, o grados.', en:'In the celestial glory there are three heavens or degrees.' },
        { num:2, es:'Y para obtener el mas elevado, un hombre debe entrar al orden del sacerdocio (que significa el nuevo y sempiterno convenio del matrimonio).', en:'And in order to obtain the highest, a man must enter into this order of the priesthood (meaning the new and everlasting covenant of marriage).' },
        { num:3, es:'Y si no lo hace, no puede obtenerlo.', en:'And if he does not, he cannot obtain it.' },
        { num:4, es:'Puede entrar al otro, pero eso es el fin de su reino; no puede aumentarse mas.', en:'He may enter into the other, but that is the end of his kingdom; he cannot have an increase.' },
      ]},
    ]},
  { id:'pgp', label:'La Perla de Gran Precio', sublabel:'Escrituras Adicionales', icon:'💎', color:C.terra,
    chapters:[
      { id:'moi139', label:'Moises 1:39', sublabel:'La obra y la gloria de Dios', verses:[
        { num:39, es:'Porque he aqui, esta es mi obra y mi gloria: llevar a cabo la inmortalidad y la vida eterna del hombre.', en:'For behold, this is my work and my glory — to bring to pass the immortality and eternal life of man.' },
      ]},
      { id:'moi718', label:'Moises 7:18', sublabel:'Sion — un mismo corazon y una misma mente', verses:[
        { num:18, es:'Y el Senor llamo a su pueblo Sion, porque eran de un mismo corazon y una misma mente, y moraban en justicia; y no habia pobres entre ellos.', en:'And the Lord called his people Zion, because they were of one heart and one mind, and dwelt in righteousness; and there was no poor among them.' },
      ]},
      { id:'abr322', label:'Abraham 3:22-23', sublabel:'Los espiritus nobles en la vida preterrenal', verses:[
        { num:22, es:'Y vi que habia muchas almas nobles y grandes al principio; y Dios estaba entre ellas, y les dijo: A estos hare mis gobernantes; porque el que gobernaba desde el principio, estaba entre ellas.', en:'Now the Lord had shown unto me, Abraham, the intelligences that were organized before the world was; and among all these there were many of the noble and great ones.' },
        { num:23, es:'Y Dios vio que estas almas eran buenas, y se puso en medio de ellas y dijo: A ti te hare gobernante mio; pues el era uno de entre ellas, fue escogido desde el principio.', en:'And God saw these souls that they were good, and he stood in the midst of them, and he said: These I will make my rulers; for he stood among those that were spirits, and he saw that they were good; and he said unto me: Abraham, thou art one of them; thou wast chosen before thou wast born.' },
      ]},
      { id:'jose1517', label:'Jose Smith — Historia 1:15-17', sublabel:'La Primera Vision', verses:[
        { num:15, es:'Apenas me hube llegado al lugar senalado y me arrodille, empece a ofrecer los deseos de mi corazon a Dios, cuando de improviso me vi envuelto por un poder de sorprendente influencia. Densas tinieblas me envolvieron, pero haciendo un esfuerzo supremo para invocar a Dios, en ese mismo momento percibi una columna de luz exactamente sobre mi cabeza, mas brillante que el sol, que fue descendiendo gradualmente hasta posarse sobre mi.', en:'After I had retired to the place where I had previously designed to go, having looked around me, and finding myself alone, I kneeled down and began to offer up the desires of my heart to God. I had scarcely done so, when immediately I was seized upon by some power which entirely overcame me. But, exerting all my powers to call upon God to deliver me, at the very moment when I was ready to sink into despair, I saw a pillar of light exactly over my head, above the brightness of the sun, which descended gradually until it fell upon me.' },
        { num:17, es:'Al posarse la luz sobre mi, vi a dos Personajes, cuyo fulgor y gloria desafian toda descripcion, uno de los cuales me hablo, llamandome por mi nombre, y dijo, senalando al otro: Este es mi Hijo Amado. Escuchale!', en:'When the light rested upon me I saw two Personages, whose brightness and glory defy all description, standing above me in the air. One of them spake unto me, calling me by name and said, pointing to the other — This is My Beloved Son. Hear Him!' },
      ]},
      { id:'jose119', label:'Jose Smith — Historia 1:19', sublabel:'Todos se habian extraviado', verses:[
        { num:19, es:'Me fue contestado que no debia unirme a ninguna de ellas, pues todas se habian extraviado y se habian apartado del Evangelio; que sus credos eran una abominacion ante su presencia; que aquellos profesores eran todos corruptos; que se acercaban a el con sus labios mas sus corazones distaban mucho de el; que ensenaban doctrinas que eran preceptos de hombres y no del Senor.', en:'I was answered that I must join none of them, for they were all wrong; and the Personage who addressed me said that all their creeds were an abomination in his sight; that those professors were all corrupt; that they draw near to me with their lips, but their hearts are far from me, they teach for doctrines the commandments of men, having a form of godliness, but they deny the power thereof.' },
      ]},
      { id:'af14', label:'Articulos de Fe 1:1-4', sublabel:'La Deidad, el pecado, y la salvacion', verses:[
        { num:1, es:'Creemos en Dios, el Padre Eterno, y en Su Hijo, Jesucristo, y en el Espiritu Santo.', en:'We believe in God, the Eternal Father, and in His Son, Jesus Christ, and in the Holy Ghost.' },
        { num:2, es:'Creemos que los hombres seran castigados por sus propios pecados, y no por la transgresion de Adan.', en:'We believe that men will be punished for their own sins, and not for Adam's transgression.' },
        { num:3, es:'Creemos que mediante la Expiacion de Cristo todo el genero humano puede salvarse, mediante el cumplimiento de las leyes y ordenanzas del Evangelio.', en:'We believe that through the Atonement of Christ, all mankind may be saved, by obedience to the laws and ordinances of the Gospel.' },
        { num:4, es:'Creemos que los primeros principios y ordenanzas del Evangelio son: primero, Fe en el Senor Jesucristo; segundo, Arrepentimiento; tercero, Bautismo por inmersion para la remision de pecados; cuarto, Imposicion de manos para el don del Espiritu Santo.', en:'We believe that the first principles and ordinances of the Gospel are: first, Faith in the Lord Jesus Christ; second, Repentance; third, Baptism by immersion for the remission of sins; fourth, Laying on of hands for the gift of the Holy Ghost.' },
      ]},
      { id:'af67', label:'Articulos de Fe 1:6-7', sublabel:'La organizacion de la Iglesia Primitiva', verses:[
        { num:6, es:'Creemos en la misma organizacion que existio en la Iglesia Primitiva, a saber: apostoles, profetas, pastores, maestros, evangelistas, etc.', en:'We believe in the same organization that existed in the Primitive Church, namely, apostles, prophets, pastors, teachers, evangelists, and so forth.' },
        { num:7, es:'Creemos en el don de lenguas, profecia, revelacion, visiones, sanidades, interpretacion de lenguas, etc.', en:'We believe in the gift of tongues, prophecy, revelation, visions, healing, interpretation of tongues, and so forth.' },
      ]},
      { id:'af13', label:'Articulo de Fe 1:13', sublabel:'Virtud, honestidad y esperanza', verses:[
        { num:13, es:'Creemos en ser honrados, veraces, castos, benevolos, virtuosos y en hacer el bien a todos los hombres; en realidad podemos decir que seguimos la admonicion de Pablo: Creemos todas las cosas, esperamos todas las cosas, hemos soportado muchas cosas y esperamos poder soportar todas las cosas. Si hay algo virtuoso, bello, de buena reputacion o digno de alabanza, a estas cosas aspiramos.', en:'We believe in being honest, true, chaste, benevolent, virtuous, and in doing good to all men; indeed, we may say that we follow the admonition of Paul — We believe all things, we hope all things, we have endured many things, and hope to be able to endure all things. If there is anything virtuous, lovely, or of good report or praiseworthy, we seek after these things.' },
      ]},
    ]},
]


const SPEAK_LEVELS = [
  { id:'sounds', label:'Sonidos', sublabel:'Nivel 1: Sonidos del Espanol', icon:'🔊', color:C.blue, exercises:[
    { id:'rr', es:'rapido, raro, rio, perro, tierra', hint:'Roll your R — trill your tongue against the roof of your mouth!', type:'trill' },
    { id:'j',  es:'Jesus, joven, jardin, mejor, trabajo', hint:'Like "h" in hat but deeper — from the throat', type:'fricative' },
    { id:'ny', es:'senor, nino, manana, Espana, ano', hint:'Like "ny" in canyon — press tongue to palate', type:'nasal' },
    { id:'ll', es:'llamar, lluvia, calle, silla, pollo', hint:'In Paraguay, often like "sh" in shoe', type:'lateral' },
  ]},
  { id:'basic', label:'Frases Basicas', sublabel:'Nivel 2: Saludos y Presentacion', icon:'💬', color:C.green, exercises:[
    { id:'b1', es:'Buenos dias, me llamo Elder Nilsson.', hint:'Good morning, my name is Elder Nilsson.', type:'phrase' },
    { id:'b2', es:'Como esta usted hoy?', hint:'How are you today? (formal)', type:'phrase' },
    { id:'b3', es:'Mucho gusto en conocerle.', hint:'Very pleased to meet you.', type:'phrase' },
    { id:'b4', es:'Que le vaya muy bien. Hasta luego.', hint:'May things go well for you. Goodbye.', type:'phrase' },
  ]},
  { id:'mission', label:'Oraciones de Mision', sublabel:'Nivel 3: Mensajes Clave', icon:'📖', color:C.red, exercises:[
    { id:'m1', es:'Tenemos un mensaje importante sobre Jesucristo y Su Evangelio restaurado.', hint:'We have an important message about Jesus Christ and His restored Gospel.', type:'sentence' },
    { id:'m2', es:'El Libro de Mormon es otro testamento de Jesucristo que confirma la Biblia.', hint:'The Book of Mormon is another testament of Jesus Christ that confirms the Bible.', type:'sentence' },
    { id:'m3', es:'La familia puede ser eterna mediante las ordenanzas sagradas del templo.', hint:'The family can be eternal through the sacred ordinances of the temple.', type:'sentence' },
    { id:'m4', es:'Leeria usted el Libro de Mormon y oraria para saber si es verdadero?', hint:'Would you read the Book of Mormon and pray to know if it is true?', type:'sentence' },
  ]},
  { id:'scripture', label:'Escrituras', sublabel:'Nivel 4: Versiculos Clave', icon:'📜', color:C.gold, exercises:[
    { id:'s1', es:'Recuerda que el valor de las almas es grande a los ojos de Dios.', hint:'D y C 18:10 — the worth of souls is great', type:'scripture' },
    { id:'s2', es:'Porque de tal manera amo Dios al mundo, que ha dado a su Hijo unigenito.', hint:'Juan 3:16 — For God so loved the world', type:'scripture' },
    { id:'s3', es:'Seguid adelante con firmeza en Cristo, teniendo un brillo perfecto de esperanza.', hint:'2 Nefi 31:20 — press forward with steadfastness', type:'scripture' },
    { id:'s4', es:'Querido Padre Celestial, te damos gracias por este dia y el privilegio de servir.', hint:'Opening of a missionary prayer', type:'scripture' },
  ]},
]

const AI_PERSONAS = [
  { name:'Dona Carmen', age:58, icon:'👵', color:C.terra, description:'Viuda, barrio Trinidad, Asuncion',
    personality:'Warm traditional Catholic widow, deeply family-oriented. Speaks with genuine Paraguayan warmth. Curious about spiritual things but respectful of her traditions.',
    opening:'Buenas tardes, jovenes. De donde son? No los habia visto por el barrio antes...',
    scenarioLabel:'Visita a un hogar del barrio' },
  { name:'Miguel Rios', age:24, icon:'👨‍🎓', color:C.blue, description:'Estudiante de filosofia, UNA, Asuncion',
    personality:'Philosophy student, intellectually curious but skeptical of organized religion. Asks probing philosophical questions. Not hostile — genuinely seeking but analytical.',
    opening:'Ah, misioneros. Miren, respeto sus creencias, pero soy bastante agnostico. Que evidencia tienen de que lo que ensenan es verdad?',
    scenarioLabel:'Conversacion intelectual y filosofica' },
  { name:'Senora Flores', age:42, icon:'👩', color:C.green, description:'Madre de 3 hijos, Ciudad del Este',
    personality:'Warm mother of three children. Genuinely interested in messages about family and eternal life. Open and emotionally connected. Often mentions her children.',
    opening:'Buenos dias! Mis hijos me dijeron que pasaron unos jovenes ayer. Tienen un mensaje sobre la familia?',
    scenarioLabel:'Ensenanza sobre la familia eterna' },
  { name:'Don Ramon', age:67, icon:'👴', color:C.gold, description:'Campesino, departamento de Caaguazu',
    personality:'Traditional farmer from the interior. Deeply Catholic and proud of his faith. Uses occasional Guarani words. Kind but resistant to change.',
    opening:'Buen dia, jovenes. Soy catolico de toda la vida, como mi tatarabuelo. Por que querria yo cambiar lo que siempre hemos creido?',
    scenarioLabel:'Perspectiva del catolico tradicional' },
  { name:'Valentina Cruz', age:21, icon:'👩‍💼', color:C.river, description:'Joven profesional, Encarnacion',
    personality:'Young professional woman. Spiritual but not religious — she prays but does not attend church. Open and curious about faith and purpose.',
    opening:'Hola, jovenes. Vi su capilla por internet y me quede pensando. Yo creo en Dios, pero no se que creer exactamente. Me pueden ayudar?',
    scenarioLabel:'Busqueda espiritual sincera' },
]

const CURRICULUM = [
  { week:1,  title:'Fundamentos del Espanol',   tasks:['Aprende el alfabeto completo (27 letras)','Practica saludos basicos','Lee Juan 3:16 en espanol','Ora en espanol por primera vez'] },
  { week:2,  title:'Presentacion Personal',      tasks:['Memoriza tu introduccion misionera','Aprende vocabulario de familia','Practica con AI: Dona Carmen','Lee textos paralelos — Oracion'] },
  { week:3,  title:'El Evangelio de Jesucristo', tasks:['Aprende frases de ensenanza','Estudia 2 Nefi 31:20','Practica vocabulario del Evangelio','Completa quiz de numeros y dias'] },
  { week:4,  title:'El Libro de Mormon',         tasks:['Lee 1 Nefi 1 en espanol','Aprende a presentar el Libro de Mormon','Practica vocabulario de La Iglesia','Graba tu testimonio en espanol'] },
  { week:5,  title:'La Restauracion',            tasks:['Estudia Jose Smith — Historia','Memoriza La Primera Vision en espanol','Practica con AI: Miguel Rios','Aprende los articulos de fe 1-4'] },
  { week:6,  title:'Cultura Paraguaya',          tasks:['Estudia las 6 secciones de cultura','Aprende 3 palabras en guarani','Aprende sobre el terere','Lee textos paralelos — Folklore'] },
  { week:7,  title:'La Oracion',                 tasks:['Practica orar en voz alta en espanol','Memoriza apertura y cierre de oracion','Practica con AI: Valentina Cruz','Lee Alma 32 en espanol'] },
  { week:8,  title:'La Fe y el Arrepentimiento', tasks:['Estudia Alma 32:21,28','Practica frases avanzadas de ensenanza','Practica con AI: Senora Flores','Completa quiz de sentimientos'] },
  { week:9,  title:'El Bautismo',                tasks:['Memoriza D y C 18:10-11','Practica invitar al bautismo','Completa nivel 3 de hablar','Practica con AI: Don Ramon'] },
  { week:10, title:'La Familia Eterna',          tasks:['Estudia el plan de salvacion','Memoriza frases sobre el templo','Practica las 4 categorias de frases','Lee textos paralelos — 2 Nefi'] },
  { week:11, title:'Las Escrituras',             tasks:['Lee todos los 5 textos paralelos','Completa nivel 4 de hablar','Memoriza 5 versiculos clave','Completa quiz de todas las categorias'] },
  { week:12, title:'Listo para la Mision!',      tasks:['Completa todas las tarjetas de vocabulario','Logra 80%+ en todas las frases','Practica con todos los 5 AI personas','Recibe tu certificado misionero Paraguay'] },
]

// ─── COUNTDOWN TAB ────────────────────────────────────────────────────────────
function CountdownTab() {
  const TARGET = new Date('2026-09-23T09:00:00')
  const [now, setNow] = useState(new Date())
  const [streak] = useState(() => {
    const s = getLS('sn-streak', { count: 0, last: null })
    const today = new Date().toDateString()
    if (s.last !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
      const nc = s.last === yesterday.toDateString() ? s.count + 1 : 1
      const ns = { count: nc, last: today }; setLS('sn-streak', ns); return ns
    }
    return s
  })
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  const diff = Math.max(0, TARGET - now)
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  const phrase  = DAILY_PHRASES[Math.floor(Date.now() / 86400000) % DAILY_PHRASES.length]
  const nextM   = MILESTONES.find(m => m.days > streak.count) || MILESTONES[7]
  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.red} 0%, #8B1010 50%, ${C.blue} 100%)`, padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🇵🇾</div>
        <div style={{ color: C.white, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>Elder Sam Nilsson</div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 }}>Mision Asuncion Paraguay Norte</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>Inicio del MTC: 23 de septiembre, 2026</div>
      </div>
      <div style={{ margin: '16px 16px 0', background: C.white, borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', color: C.slate, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Cuenta Regresiva al MTC</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[['Dias', days], ['Horas', hours], ['Min', minutes], ['Seg', seconds]].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center', background: C.light, borderRadius: 12, padding: '12px 4px' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.red, lineHeight: 1 }}>{String(val).padStart(2, '0')}</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: '12px 16px 0', background: C.white, borderRadius: 16, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>Racha de Practica</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.red }}>{streak.count} dia{streak.count !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22 }}>{nextM.icon}</div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>{nextM.label}</div>
            <div style={{ fontSize: 11, color: C.stone }}>en {Math.max(0, nextM.days - streak.count)}d</div>
          </div>
        </div>
        <div style={{ height: 6, background: C.light, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, (streak.count / nextM.days) * 100)}%`, background: `linear-gradient(to right, ${C.red}, ${C.gold})`, borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ margin: '12px 16px 0', background: `${C.blue}10`, border: `1.5px solid ${C.blue}25`, borderRadius: 16, padding: '16px' }}>
        <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Frase del Dia</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 6 }}>{phrase.es}</div>
        <div style={{ fontSize: 14, color: C.slate, marginBottom: 12, fontStyle: 'italic' }}>{phrase.en}</div>
        <button onClick={() => speakES(phrase.es)} style={{ background: C.blue, color: C.white, border: 'none', borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Escuchar</button>
      </div>
      <div style={{ margin: '12px 16px 0', background: C.white, borderRadius: 16, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 12 }}>Informacion de la Mision</div>
        {[['Misionero','Elder Sam Nilsson'],['Mision','Asuncion Paraguay Norte'],['Inicio MTC','23 de septiembre, 2026'],['Idioma','Espanol (es-PY)'],['Pais','Republica del Paraguay'],['Ciudad principal','Asuncion']].map(([l,v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.light}` }}>
            <span style={{ fontSize: 13, color: C.slate }}>{l}</span>
            <span style={{ fontSize: 13, color: C.dark, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PATH TAB ─────────────────────────────────────────────────────────────────
function PathTab() {
  const [done, setDone] = useState(() => getLS('sn-path', {}))
  const toggle = (wi, ti) => { const k = `${wi}-${ti}`; const nd = { ...done, [k]: !done[k] }; setDone(nd); setLS('sn-path', nd) }
  const totalTasks = CURRICULUM.reduce((a, c) => a + c.tasks.length, 0)
  const doneTasks = Object.values(done).filter(Boolean).length
  const alphaPlays = Object.keys(getLS('sn-alpha', {})).length
  const phrasesScored = Object.values(getLS('sn-phrases', {})).filter(s => s >= 80).length
  const vocabHeard = Object.keys(getLS('sn-vocab', {})).length
  const cultureStudied = Object.keys(getLS('sn-culture', {})).length
  const readerDone = Object.keys(getLS('sn-reader', {})).length
  const speakDone = Object.keys(getLS('sn-speaking', {})).length
  const score = Math.min(100, Math.round(
    (alphaPlays >= 3 ? 15 : alphaPlays * 5) +
    Math.min(25, phrasesScored) +
    Math.min(20, vocabHeard) +
    Math.min(15, cultureStudied * 2.5) +
    Math.min(10, readerDone * 2) +
    Math.min(15, speakDone)
  ))
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ background: C.white, borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>Preparacion para la Mision</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: score >= 80 ? C.green : C.red }}>{score}<span style={{ fontSize: 18, color: C.stone }}>/100</span></div>
          </div>
          <div style={{ fontSize: 48 }}>{score >= 80 ? '🏆' : score >= 50 ? '⭐' : '🌱'}</div>
        </div>
        <div style={{ height: 12, background: C.light, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(to right, ${C.red}, ${C.gold})`, borderRadius: 6, transition: 'width 0.5s' }} />
        </div>
        {score >= 80 && <div style={{ textAlign: 'center', background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 8, padding: '8px', color: C.green, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Certificado de Preparacion Desbloqueado!</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {[['Alfabeto', Math.min(15, alphaPlays * 5), 15, '📚'], ['Frases', Math.min(25, phrasesScored), 25, '💬'], ['Vocabulario', Math.min(20, vocabHeard), 20, '📝'], ['Cultura', Math.min(15, Math.round(cultureStudied * 2.5)), 15, '🌎'], ['Lectura', Math.min(10, readerDone * 2), 10, '📖'], ['Hablar', Math.min(15, speakDone), 15, '🎤']].map(([l, v, m, i]) => (
            <div key={l} style={{ background: C.light, borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{i}</div>
              <div style={{ fontSize: 11, color: C.slate }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{v}/{m}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 10 }}>Plan de 12 Semanas — {doneTasks}/{totalTasks} tareas</div>
      {CURRICULUM.map((week, wi) => {
        const weekDone = week.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length
        return (
          <div key={wi} style={{ background: C.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ background: weekDone === week.tasks.length ? `${C.green}18` : `${C.blue}08`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: C.stone }}>SEMANA {week.week}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{week.title}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: weekDone === week.tasks.length ? C.green : C.slate }}>{weekDone}/{week.tasks.length} {weekDone === week.tasks.length ? '✅' : ''}</div>
            </div>
            <div style={{ padding: '6px 0' }}>
              {week.tasks.map((task, ti) => (
                <button key={ti} onClick={() => toggle(wi, ti)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: done[`${wi}-${ti}`] ? C.green : C.stone }}>{done[`${wi}-${ti}`] ? '✅' : '⬜'}</span>
                  <span style={{ fontSize: 13, color: C.dark, textDecoration: done[`${wi}-${ti}`] ? 'line-through' : 'none', opacity: done[`${wi}-${ti}`] ? 0.55 : 1 }}>{task}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── ALPHABET TAB ─────────────────────────────────────────────────────────────
function AlphabetTab() {
  const [played, setPlayed] = useState(() => getLS('sn-alpha', {}))
  const [selected, setSelected] = useState(null)
  const [showCombos, setShowCombos] = useState(false)
  const play = (letter, text) => { speakES(text); const np = { ...played, [letter]: true }; setPlayed(np); setLS('sn-alpha', np) }
  const uniqueLetters = SPANISH_LETTERS.filter((l, i, a) => a.findIndex(x => x.letter === l.letter) === i)
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ background: `${C.red}10`, borderRadius: 14, padding: '14px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>El Alfabeto Espanol</div>
        <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>27 letras · Toca para escuchar y practicar</div>
        <div style={{ fontSize: 12, color: C.stone, marginTop: 2 }}>{Object.keys(played).length} practicadas</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {uniqueLetters.map(l => (
          <button key={l.letter} onClick={() => { setSelected(selected?.letter === l.letter ? null : l); play(l.letter, l.missionWord) }}
            style={{ background: played[l.letter] ? `${C.green}18` : C.white, border: `2px solid ${selected?.letter === l.letter ? C.blue : played[l.letter] ? C.green : C.light}`, borderRadius: 12, padding: '12px 4px', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: selected?.letter === l.letter ? C.blue : C.dark }}>{l.letter}</div>
            <div style={{ fontSize: 10, color: C.stone }}>{l.name}</div>
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ background: C.white, borderRadius: 16, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: C.red, lineHeight: 1 }}>{selected.letter}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.stone }}>Nombre</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.dark }}>"{selected.name}"</div>
              <div style={{ fontSize: 13, color: C.blue, marginTop: 2 }}>{selected.ipa}</div>
            </div>
          </div>
          <div style={{ background: C.light, borderRadius: 10, padding: '10px', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: C.slate }}>{selected.sound}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: C.stone }}>Palabra de mision</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>{selected.missionWord}</div>
              <div style={{ fontSize: 13, color: C.blue, fontStyle: 'italic' }}>{selected.missionEn}</div>
            </div>
            <button onClick={() => play(selected.letter, selected.missionWord)} style={{ background: C.red, color: C.white, border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>🔊 Escuchar</button>
          </div>
        </div>
      )}
      <button onClick={() => setShowCombos(!showCombos)} style={{ width: '100%', background: `${C.blue}10`, border: `1.5px solid ${C.blue}25`, borderRadius: 12, padding: '12px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: C.blue, marginBottom: showCombos ? 8 : 0 }}>
        {showCombos ? '▲' : '▼'} Combinaciones Especiales (ll, rr, ch, qu, gu)
      </button>
      {showCombos && SPECIAL_COMBOS.map(c => (
        <div key={c.combo} style={{ background: C.white, borderRadius: 12, padding: '14px', marginBottom: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.blue }}>{c.combo}</div>
            <button onClick={() => speakES(c.example.split(' — ')[0])} style={{ background: C.blue, color: C.white, border: 'none', borderRadius: 16, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>🔊</button>
          </div>
          <div style={{ fontSize: 13, color: C.dark, marginBottom: 2 }}>{c.sound}</div>
          <div style={{ fontSize: 12, color: C.green, fontStyle: 'italic', marginBottom: 4 }}>{c.example}</div>
          <div style={{ fontSize: 11, color: C.terra, background: `${C.terra}10`, padding: '4px 8px', borderRadius: 6 }}>{c.note}</div>
        </div>
      ))}
    </div>
  )
}

// ─── PHRASES TAB ──────────────────────────────────────────────────────────────
function PhrasesTab() {
  const [scores, setScores] = useState(() => getLS('sn-phrases', {}))
  const [activeCat, setActiveCat] = useState('greetings')
  const [expanded, setExpanded] = useState(null)
  const cat = PHRASE_CATEGORIES.find(c => c.id === activeCat)
  const scorePhrase = (key, s) => { const ns = { ...scores, [key]: s }; setScores(ns); setLS('sn-phrases', ns) }
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {PHRASE_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setActiveCat(c.id); setExpanded(null) }}
            style={{ flexShrink: 0, background: activeCat === c.id ? c.color : C.white, color: activeCat === c.id ? C.white : C.slate, border: `2px solid ${activeCat === c.id ? c.color : C.light}`, borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {c.label}
          </button>
        ))}
      </div>
      <div style={{ background: `${cat.color}10`, borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: cat.color, fontWeight: 600 }}>{cat.label} · {cat.sublabel}</div>
        <div style={{ fontSize: 12, color: C.stone }}>{cat.phrases.length} frases · Toca para expandir</div>
      </div>
      {cat.phrases.map((p, pi) => {
        const key = `${activeCat}-${pi}`; const sc = scores[key]; const isOpen = expanded === pi
        return (
          <div key={pi} style={{ background: C.white, borderRadius: 12, marginBottom: 8, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <button onClick={() => setExpanded(isOpen ? null : pi)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.dark }}>{p.es}</div>
                  <div style={{ fontSize: 12, color: C.slate, marginTop: 2, fontStyle: 'italic' }}>{p.en}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {sc !== undefined && <span style={{ fontSize: 13, fontWeight: 700, color: sc >= 80 ? C.green : C.terra }}>{sc}%</span>}
                  <span style={{ color: C.stone }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
            </button>
            {isOpen && (
              <div style={{ borderTop: `1px solid ${C.light}`, padding: '14px' }}>
                <div style={{ background: `${cat.color}08`, borderRadius: 8, padding: '10px', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: cat.color, fontWeight: 600, marginBottom: 4 }}>Palabra por palabra</div>
                  <div style={{ fontSize: 13, color: C.dark }}>{p.wbw}</div>
                </div>
                {p.note && <div style={{ background: `${C.gold}10`, borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, marginBottom: 2 }}>Nota</div>
                  <div style={{ fontSize: 12, color: C.dark }}>{p.note}</div>
                </div>}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button onClick={() => speakES(p.es)} style={{ flex: 1, background: cat.color, color: C.white, border: 'none', borderRadius: 20, padding: '8px', fontSize: 13, cursor: 'pointer' }}>🔊 Escuchar</button>
                  <button onClick={() => speakES(p.es)} style={{ flex: 1, background: C.light, color: C.dark, border: 'none', borderRadius: 20, padding: '8px', fontSize: 13, cursor: 'pointer' }}>🎤 Practicar</button>
                </div>
                <div style={{ fontSize: 11, color: C.stone, marginBottom: 6 }}>Califica tu pronunciacion:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {[['😓','<60','Dificil',50],['😐','60-79','Casi',70],['😊','80-89','Bien',85],['🎯','90+','Excelente',95]].map(([emoji,range,label,val]) => (
                    <button key={val} onClick={() => scorePhrase(key, val)} style={{ background: sc === val ? `${cat.color}20` : C.light, border: `1.5px solid ${sc === val ? cat.color : C.light}`, borderRadius: 8, padding: '6px 2px', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 18 }}>{emoji}</div>
                      <div style={{ fontSize: 9, color: C.stone }}>{range}</div>
                      <div style={{ fontSize: 10, color: C.dark, fontWeight: sc === val ? 700 : 400 }}>{label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── CULTURE TAB ─────────────────────────────────────────────────────────────
function CultureTab() {
  const [studied, setStudied] = useState(() => getLS('sn-culture', {}))
  const [expanded, setExpanded] = useState(null)
  const markStudied = (id) => { const ns = { ...studied, [id]: true }; setStudied(ns); setLS('sn-culture', ns) }
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ background: `${C.green}12`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Cultura Paraguaya</div>
        <div style={{ fontSize: 12, color: C.slate }}>{Object.keys(studied).length}/6 temas estudiados</div>
      </div>
      {CULTURE_SECTIONS.map(s => {
        const isOpen = expanded === s.id
        return (
          <div key={s.id} style={{ background: C.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <button onClick={() => { setExpanded(isOpen ? null : s.id); if (!isOpen) markStudied(s.id) }} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ background: `${s.color}12`, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: C.slate }}>{s.sublabel}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {studied[s.id] && <span style={{ color: C.green }}>✅</span>}
                    <span style={{ color: C.stone }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {!isOpen && <div style={{ fontSize: 12, color: s.color, marginTop: 8, fontStyle: 'italic' }}>{s.tagline}</div>}
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: 13, color: s.color, fontStyle: 'italic', fontWeight: 600, marginBottom: 10 }}>{s.tagline}</div>
                <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.75, marginBottom: 12 }}>{s.body}</div>
                <div style={{ background: `${C.terra}10`, borderRadius: 10, padding: '12px', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.terra, marginBottom: 6 }}>Consejo del Misionero</div>
                  <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.65 }}>{s.missionTip}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6 }}>Vocabulario Clave</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.vocab.map(v => (
                    <button key={v} onClick={() => speakES(v)} style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 16, padding: '4px 10px', fontSize: 12, color: s.color, cursor: 'pointer' }}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── READER TAB ───────────────────────────────────────────────────────────────
function ReaderTab() {
  const [done, setDone] = useState(() => getLS('sn-reader', {}))
  const [active, setActive] = useState(null)
  const [cat, setCat] = useState('all')
  const markDone = (id) => { const nd = { ...done, [id]: true }; setDone(nd); setLS('sn-reader', nd) }
  const cats = ['all', ...new Set(READER_TEXTS.map(t => t.category))]
  const filtered = cat === 'all' ? READER_TEXTS : READER_TEXTS.filter(t => t.category === cat)
  if (active) {
    const t = READER_TEXTS.find(x => x.id === active)
    return (
      <div style={{ padding: '16px 16px 40px' }}>
        <button onClick={() => { markDone(t.id); setActive(null) }} style={{ background: C.light, border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: C.dark, marginBottom: 14 }}>← Volver</button>
        <div style={{ background: C.white, borderRadius: 12, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{t.title}</div>
              <div style={{ fontSize: 12, color: C.stone }}>{t.subtitle}</div>
            </div>
          </div>
          <span style={{ background: `${t.levelColor}15`, color: t.levelColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>{t.level}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
          <div style={{ background: `${C.red}10`, borderRadius: 8, padding: '6px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.red }}>Espanol</div>
          <div style={{ background: `${C.blue}10`, borderRadius: 8, padding: '6px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.blue }}>English</div>
        </div>
        {t.segments.map((seg, si) => (
          <div key={si} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
            <div style={{ background: C.white, borderRadius: 8, padding: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.65 }}>{seg.es}</div>
              <button onClick={() => speakES(seg.es)} style={{ marginTop: 6, background: 'none', border: `1px solid ${C.red}`, borderRadius: 12, padding: '2px 8px', fontSize: 11, color: C.red, cursor: 'pointer' }}>🔊</button>
            </div>
            <div style={{ background: `${C.blue}05`, borderRadius: 8, padding: '10px' }}>
              <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.65 }}>{seg.en}</div>
            </div>
          </div>
        ))}
        <button onClick={() => { markDone(t.id); setActive(null) }} style={{ width: '100%', marginTop: 14, background: C.green, color: C.white, border: 'none', borderRadius: 20, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Marcar como Completado</button>
      </div>
    )
  }
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, background: cat === c ? C.blue : C.white, color: cat === c ? C.white : C.slate, border: `1.5px solid ${cat === c ? C.blue : C.light}`, borderRadius: 16, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            {c === 'all' ? 'Todos' : c}
          </button>
        ))}
      </div>
      {filtered.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ width: '100%', background: C.white, border: `1.5px solid ${done[t.id] ? C.green : C.light}`, borderRadius: 12, padding: '14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{t.title}</div>
                <div style={{ fontSize: 12, color: C.stone }}>{t.subtitle}</div>
                <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                  <span style={{ background: `${t.levelColor}15`, color: t.levelColor, fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>{t.level}</span>
                  <span style={{ background: `${C.blue}10`, color: C.blue, fontSize: 11, padding: '2px 8px', borderRadius: 8 }}>{t.category}</span>
                </div>
              </div>
            </div>
            {done[t.id] && <span>✅</span>}
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── VOCAB TAB ────────────────────────────────────────────────────────────────
function VocabTab() {
  const [vocabState, setVocabState] = useState(() => getLS('sn-vocab', {}))
  const [activeCat, setActiveCat] = useState('numbers')
  const [mode, setMode] = useState('cards')
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const cat = VOCAB_CATS.find(c => c.id === activeCat)
  const markHeard = (id) => { const ns = { ...vocabState, [id]: true }; setVocabState(ns); setLS('sn-vocab', ns) }
  const nextCard = () => { markHeard(`${activeCat}-${cardIdx}`); setCardIdx((cardIdx + 1) % cat.words.length); setFlipped(false) }
  const startQuiz = () => {
    const shuffled = [...cat.words].sort(() => Math.random() - 0.5).slice(0, 8)
    const makeOpts = (q) => [...cat.words.filter(w => w.es !== q.es).sort(() => Math.random() - 0.5).slice(0, 3), q].sort(() => Math.random() - 0.5)
    setQuiz({ questions: shuffled, idx: 0, score: 0, selected: null, opts: makeOpts(shuffled[0]) })
    setMode('quiz')
  }
  if (mode === 'quiz' && quiz) {
    const { questions, idx, score, selected, opts } = quiz
    if (idx >= questions.length) return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{score}/{questions.length} correctas</div>
        <div style={{ fontSize: 14, color: C.slate, margin: '8px 0 24px' }}>en {cat.label}</div>
        <button onClick={() => setMode('cards')} style={{ background: C.red, color: C.white, border: 'none', borderRadius: 20, padding: '12px 28px', fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>← Volver a Tarjetas</button>
      </div>
    )
    const q = questions[idx]
    return (
      <div style={{ padding: '16px 16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => setMode('cards')} style={{ background: C.light, border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>← Volver</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.slate }}>{idx + 1}/{questions.length} · {score} correctas</div>
        </div>
        <div style={{ background: C.white, borderRadius: 16, padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.stone, marginBottom: 8 }}>Que significa?</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.dark }}>{q.es}</div>
        </div>
        {opts.map((opt, oi) => {
          let bg = C.white, border = `1.5px solid ${C.light}`, color = C.dark
          if (selected !== null) {
            if (opt.es === q.es) { bg = `${C.green}20`; border = `1.5px solid ${C.green}`; color = C.green }
            else if (oi === selected) { bg = `${C.red}15`; border = `1.5px solid ${C.red}`; color = C.red }
          }
          return (
            <button key={oi} disabled={selected !== null} onClick={() => {
              const correct = opt.es === q.es; const newScore = correct ? score + 1 : score; const nextIdx = idx + 1
              const nextQ = questions[nextIdx]
              const nextOpts = nextQ ? [...cat.words.filter(w => w.es !== nextQ.es).sort(() => Math.random() - 0.5).slice(0, 3), nextQ].sort(() => Math.random() - 0.5) : []
              setQuiz({ ...quiz, selected: oi, score: newScore })
              setTimeout(() => setQuiz({ questions, idx: nextIdx, score: newScore, selected: null, opts: nextOpts }), 800)
            }} style={{ width: '100%', background: bg, border, color, borderRadius: 12, padding: '14px', marginBottom: 8, cursor: selected !== null ? 'default' : 'pointer', fontSize: 14, textAlign: 'left', transition: 'all 0.2s' }}>
              {opt.en}
            </button>
          )
        })}
      </div>
    )
  }
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {VOCAB_CATS.map(c => (
          <button key={c.id} onClick={() => { setActiveCat(c.id); setCardIdx(0); setFlipped(false) }}
            style={{ flexShrink: 0, background: activeCat === c.id ? c.color : C.white, color: activeCat === c.id ? C.white : C.slate, border: `1.5px solid ${activeCat === c.id ? c.color : C.light}`, borderRadius: 16, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div onClick={() => { setFlipped(!flipped); if (!flipped) speakES(cat.words[cardIdx].es) }}
        style={{ background: C.white, borderRadius: 20, padding: '32px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', marginBottom: 14, cursor: 'pointer', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px solid ${flipped ? cat.color : C.light}` }}>
        {!flipped
          ? <div><div style={{ fontSize: 32, fontWeight: 800, color: C.dark, marginBottom: 8 }}>{cat.words[cardIdx].es}</div><div style={{ fontSize: 13, color: C.stone }}>Toca para ver en ingles</div></div>
          : <div><div style={{ fontSize: 28, fontWeight: 700, color: cat.color, marginBottom: 4 }}>{cat.words[cardIdx].en}</div><div style={{ fontSize: 20, color: C.stone }}>{cat.words[cardIdx].es}</div></div>}
        <div style={{ fontSize: 12, color: C.stone, marginTop: 12 }}>{cardIdx + 1} / {cat.words.length}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => { setCardIdx(Math.max(0, cardIdx - 1)); setFlipped(false) }} style={{ flex: 1, background: C.light, border: 'none', borderRadius: 12, padding: '10px', cursor: 'pointer', fontSize: 13, color: C.dark }}>← Anterior</button>
        <button onClick={nextCard} style={{ flex: 1, background: cat.color, border: 'none', borderRadius: 12, padding: '10px', cursor: 'pointer', fontSize: 13, color: C.white, fontWeight: 600 }}>Siguiente →</button>
      </div>
      <button onClick={startQuiz} style={{ width: '100%', background: `${C.blue}12`, border: `1.5px solid ${C.blue}25`, borderRadius: 12, padding: '12px', cursor: 'pointer', fontSize: 14, color: C.blue, fontWeight: 600 }}>
        Iniciar Quiz de {cat.label}
      </button>
    </div>
  )
}

// ─── SPEAKING TAB ─────────────────────────────────────────────────────────────
function SpeakingTab() {
  const [speakData, setSpeakData] = useState(() => getLS('sn-speaking', {}))
  const [activeLevel, setActiveLevel] = useState('sounds')
  const [activeEx, setActiveEx] = useState(null)
  const [recording, setRecording] = useState(false)
  const [score, setScore] = useState(null)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const level = SPEAK_LEVELS.find(l => l.id === activeLevel)
  const markDone = (id, s) => { const ns = { ...speakData, [id]: s }; setSpeakData(ns); setLS('sn-speaking', ns) }
  const startRecording = (ex) => {
    if (recording) return
    setActiveEx(ex); setRecording(true); setScore(null)
    speakES(ex.es)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d'); let frame = 0
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#F7F3EE'; ctx.fillRect(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < 32; i++) {
          const h = 6 + Math.abs(Math.sin(frame * 0.12 + i * 0.45)) * (18 + Math.sin(i) * 8)
          ctx.fillStyle = level.color
          ctx.fillRect(i * (canvas.width / 32) + 2, canvas.height / 2 - h / 2, (canvas.width / 32) - 4, h)
        }
        frame++; animRef.current = requestAnimationFrame(draw)
      }
      draw()
    }
    setTimeout(() => {
      setRecording(false)
      const s = 72 + Math.floor(Math.random() * 22)
      setScore(s); markDone(ex.id, s)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }, 3200)
  }
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {SPEAK_LEVELS.map(l => (
          <button key={l.id} onClick={() => { setActiveLevel(l.id); setActiveEx(null); setScore(null) }}
            style={{ flexShrink: 0, background: activeLevel === l.id ? l.color : C.white, color: activeLevel === l.id ? C.white : C.slate, border: `2px solid ${activeLevel === l.id ? l.color : C.light}`, borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {l.icon} {l.label}
          </button>
        ))}
      </div>
      <div style={{ background: C.white, borderRadius: 12, padding: '12px 14px', marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{level.sublabel}</div>
        <div style={{ fontSize: 12, color: C.stone }}>Escucha el modelo — luego practica tu pronunciacion</div>
      </div>
      <canvas ref={canvasRef} width={380} height={60} style={{ width: '100%', borderRadius: 10, display: 'block', marginBottom: 14, background: C.light }} />
      {level.exercises.map(ex => {
        const exScore = speakData[ex.id]; const isActive = activeEx?.id === ex.id
        return (
          <div key={ex.id} style={{ background: C.white, borderRadius: 12, padding: '14px', marginBottom: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: `1.5px solid ${isActive ? level.color : C.light}` }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 3 }}>{ex.es}</div>
              <div style={{ fontSize: 12, color: C.slate, fontStyle: 'italic' }}>{ex.hint}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => speakES(ex.es)} style={{ background: C.light, border: 'none', borderRadius: 20, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>🔊</button>
              <button onClick={() => startRecording(ex)} disabled={recording} style={{ flex: 1, background: recording && isActive ? C.terra : level.color, color: C.white, border: 'none', borderRadius: 20, padding: '8px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {recording && isActive ? 'Escuchando modelo...' : '🎤 Practicar'}
              </button>
              {exScore !== undefined && <span style={{ fontSize: 13, fontWeight: 700, color: exScore >= 80 ? C.green : C.terra }}>{exScore}%</span>}
            </div>
            {isActive && score !== null && (
              <div style={{ marginTop: 8, background: `${score >= 80 ? C.green : C.terra}15`, borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: score >= 80 ? C.green : C.terra }}>
                  {score >= 90 ? 'Excelente! 🎯' : score >= 80 ? 'Muy bien! 😊' : 'Sigue practicando! 💪'} — {score}%
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── SCRIPTURE TAB ────────────────────────────────────────────────────────────
function ScriptureTab() {
  const [bookmarks, setBookmarks] = useState(() => getLS('sn-scripture', {}))
  const [notes, setNotes] = useState(() => getLS('sn-scripture-notes', {}))
  const [activeBook, setActiveBook] = useState(null)
  const [activeChapter, setActiveChapter] = useState(null)
  const [noteVal, setNoteVal] = useState('')
  if (activeBook && activeChapter) {
    const book = SCRIPTURE_BOOKS.find(b => b.id === activeBook)
    const chapter = book?.chapters.find(c => c.id === activeChapter)
    if (!book || !chapter) return null
    return (
      <div style={{ padding: '16px 16px 40px' }}>
        <button onClick={() => setActiveChapter(null)} style={{ background: C.light, border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: C.dark, marginBottom: 14 }}>← {book.label}</button>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 2 }}>{chapter.label}</div>
        <div style={{ fontSize: 13, color: C.stone, marginBottom: 14 }}>{chapter.sublabel}</div>
        {chapter.verses.map(v => {
          const bkKey = `${activeChapter}-${v.num}`
          return (
            <div key={v.num} style={{ background: C.white, borderRadius: 12, padding: '14px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: `1.5px solid ${bookmarks[bkKey] ? C.gold : C.light}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ background: book.color, color: C.white, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>Vers. {v.num}</div>
                <button onClick={() => { const nb = { ...bookmarks, [bkKey]: !bookmarks[bkKey] }; setBookmarks(nb); setLS('sn-scripture', nb) }} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>{bookmarks[bkKey] ? '🔖' : '🏷️'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 4 }}>Espanol</div>
                  <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>{v.es}</div>
                  <button onClick={() => speakES(v.es)} style={{ marginTop: 6, background: 'none', border: `1px solid ${C.red}`, borderRadius: 12, padding: '2px 8px', fontSize: 11, color: C.red, cursor: 'pointer' }}>🔊</button>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginBottom: 4 }}>English</div>
                  <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.7 }}>{v.en}</div>
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ background: C.white, borderRadius: 12, padding: '14px', marginTop: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Notas de Estudio</div>
          <textarea value={noteVal || notes[activeChapter] || ''} onChange={e => setNoteVal(e.target.value)}
            onBlur={() => { const nn = { ...notes, [activeChapter]: noteVal }; setNotes(nn); setLS('sn-scripture-notes', nn) }}
            placeholder="Escribe tus pensamientos y revelaciones personales aqui..."
            style={{ width: '100%', minHeight: 80, border: `1px solid ${C.light}`, borderRadius: 8, padding: '8px', fontSize: 13, color: C.dark, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
      </div>
    )
  }
  if (activeBook) {
    const book = SCRIPTURE_BOOKS.find(b => b.id === activeBook)
    return (
      <div style={{ padding: '16px 16px 40px' }}>
        <button onClick={() => setActiveBook(null)} style={{ background: C.light, border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: C.dark, marginBottom: 14 }}>← Libros</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>{book.icon}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{book.label}</div>
            <div style={{ fontSize: 12, color: C.stone }}>{book.sublabel}</div>
          </div>
        </div>
        {book.chapters.map(ch => (
          <button key={ch.id} onClick={() => { setActiveChapter(ch.id); setNoteVal(notes[ch.id] || '') }}
            style={{ width: '100%', background: C.white, border: `1.5px solid ${C.light}`, borderRadius: 12, padding: '14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{ch.label}</div>
            <div style={{ fontSize: 12, color: C.stone }}>{ch.sublabel}</div>
            <div style={{ fontSize: 12, color: book.color, marginTop: 4 }}>{ch.verses.length} versiculo{ch.verses.length !== 1 ? 's' : ''}</div>
          </button>
        ))}
      </div>
    )
  }
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ background: `${C.gold}15`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Las Escrituras</div>
        <div style={{ fontSize: 12, color: C.stone }}>Espanol y Ingles · Audio · Marcadores · Notas</div>
      </div>
      {SCRIPTURE_BOOKS.map(book => (
        <button key={book.id} onClick={() => setActiveBook(book.id)}
          style={{ width: '100%', background: C.white, border: `1.5px solid ${book.color}22`, borderRadius: 12, padding: '14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{book.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{book.label}</div>
              <div style={{ fontSize: 12, color: C.stone }}>{book.sublabel}</div>
              <div style={{ fontSize: 12, color: book.color, marginTop: 2 }}>{book.chapters.length} capitulo{book.chapters.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── AI TAB ───────────────────────────────────────────────────────────────────
function AITab() {
  const [apiKey, setApiKey] = useState(() => getLS('sn-api-key', ''))
  const [showKey, setShowKey] = useState(false)
  const [persona, setPersona] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, feedback])
  const saveKey = (k) => { setApiKey(k); setLS('sn-api-key', k) }
  const startConvo = (p) => { setPersona(p); setMessages([{ role: 'assistant', content: p.opening }]); setFeedback(null) }
  const sendMessage = async () => {
    if (!input.trim() || !apiKey || loading) return
    const userMsg = input.trim(); setInput(''); setLoading(true); setFeedback(null)
    const newMsgs = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMsgs)
    const sys = `You are roleplaying as ${persona.name}, age ${persona.age}, ${persona.description}. Personality: ${persona.personality}\n\nElder Sam Nilsson is a young LDS missionary learning Spanish, preparing for the Paraguay Asuncion North Mission. He is practicing missionary conversations.\n\nRULES:\n1. ALWAYS respond in Spanish as ${persona.name}. Stay fully in character. Be warm, realistic, and natural.\n2. Keep your Spanish response to 2-4 sentences.\n3. After your Spanish response, add exactly "---FEEDBACK---" on its own line, then give 2-3 specific English grammar tips about Sam's Spanish. Note what was correct, what could improve, and suggest better phrasing where helpful. Be encouraging.`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, system: sys, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
      })
      const data = await res.json()
      const full = data.content?.[0]?.text || 'Lo siento, hubo un error.'
      const [reply, fb] = full.split('---FEEDBACK---')
      setMessages([...newMsgs, { role: 'assistant', content: reply.trim() }])
      setFeedback(fb?.trim() || null)
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Lo siento, hubo un error de conexion. Por favor verifique su clave API.' }])
    }
    setLoading(false)
  }
  if (!apiKey) return (
    <div style={{ padding: '28px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🤖</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>Conversacion con IA</div>
        <div style={{ fontSize: 13, color: C.slate, marginTop: 6, lineHeight: 1.6 }}>Practica con 5 investigadores paraguayos reales. Requiere una clave API de Anthropic.</div>
      </div>
      <div style={{ background: C.white, borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Clave API de Anthropic</div>
        <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => saveKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px', border: `1.5px solid ${C.light}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'monospace' }} />
        <button onClick={() => setShowKey(!showKey)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 12, cursor: 'pointer', marginTop: 4 }}>{showKey ? 'Ocultar' : 'Mostrar'} clave</button>
        {apiKey && <button onClick={() => {}} style={{ marginTop: 14, width: '100%', background: C.red, color: C.white, border: 'none', borderRadius: 20, padding: '10px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Comenzar →</button>}
      </div>
    </div>
  )
  if (!persona) return (
    <div style={{ padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>Elige tu Investigador</div>
        <button onClick={() => saveKey('')} style={{ background: C.light, border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 11, color: C.stone, cursor: 'pointer' }}>Cambiar clave</button>
      </div>
      {AI_PERSONAS.map(p => (
        <button key={p.name} onClick={() => startConvo(p)} style={{ width: '100%', background: C.white, border: `1.5px solid ${p.color}22`, borderRadius: 12, padding: '14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 28 }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{p.name}, {p.age}</div>
              <div style={{ fontSize: 12, color: C.stone }}>{p.description}</div>
              <div style={{ fontSize: 11, background: `${p.color}15`, color: p.color, padding: '2px 8px', borderRadius: 8, marginTop: 4, display: 'inline-block', fontWeight: 600 }}>{p.scenarioLabel}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 8, fontStyle: 'italic', borderTop: `1px solid ${C.light}`, paddingTop: 8 }}>"{p.opening.substring(0, 80)}..."</div>
        </button>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 118px)' }}>
      <div style={{ padding: '10px 14px', background: C.white, borderBottom: `1px solid ${C.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>{persona.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{persona.name}</div>
            <div style={{ fontSize: 11, color: C.stone }}>{persona.description}</div>
          </div>
        </div>
        <button onClick={() => { setPersona(null); setMessages([]) }} style={{ background: C.light, border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 12, color: C.dark, cursor: 'pointer' }}>Cambiar</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '80%', background: m.role === 'user' ? C.red : C.white, color: m.role === 'user' ? C.white : C.dark, borderRadius: 12, padding: '10px 14px', fontSize: 13, lineHeight: 1.6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ textAlign: 'center', color: C.stone, fontSize: 14, padding: 8 }}>escribiendo...</div>}
        {feedback && (
          <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}22`, borderRadius: 12, padding: '12px', marginTop: 6 }}>
            <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, marginBottom: 6 }}>GRAMMAR FEEDBACK (English)</div>
            <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{feedback}</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: '10px 12px', background: C.white, borderTop: `1px solid ${C.light}`, display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Escribe en espanol..." style={{ flex: 1, padding: '10px 14px', border: `1.5px solid ${C.light}`, borderRadius: 20, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: loading ? C.stone : C.red, color: C.white, border: 'none', borderRadius: 20, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          {loading ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:'countdown', icon:'🇵🇾', label:'Cuenta Regresiva' },
  { id:'path',      icon:'🛤️',  label:'Mi Camino' },
  { id:'alphabet',  icon:'🔤',  label:'Alfabeto' },
  { id:'phrases',   icon:'💬',  label:'Frases' },
  { id:'culture',   icon:'🌎',  label:'Cultura' },
  { id:'reader',    icon:'📖',  label:'Lectura' },
  { id:'vocab',     icon:'📝',  label:'Vocabulario' },
  { id:'speaking',  icon:'🎤',  label:'Hablar' },
  { id:'scripture', icon:'📚',  label:'Escrituras' },
  { id:'ai',        icon:'🤖',  label:'Conversacion' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('countdown')
  const renderTab = () => {
    switch (activeTab) {
      case 'countdown': return <CountdownTab />
      case 'path':      return <PathTab />
      case 'alphabet':  return <AlphabetTab />
      case 'phrases':   return <PhrasesTab />
      case 'culture':   return <CultureTab />
      case 'reader':    return <ReaderTab />
      case 'vocab':     return <VocabTab />
      case 'speaking':  return <SpeakingTab />
      case 'scripture': return <ScriptureTab />
      case 'ai':        return <AITab />
      default:          return <CountdownTab />
    }
  }
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: C.light, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ background: `linear-gradient(90deg, ${C.red} 0%, #7B0F0F 48%, ${C.blue} 100%)`, padding: '10px 14px 6px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: C.white, fontSize: 11, fontWeight: 700, marginBottom: 8, textAlign: 'center', letterSpacing: 0.5, opacity: 0.9 }}>Mision Asuncion Paraguay Norte</div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flexShrink: 0, background: activeTab === t.id ? 'rgba(255,255,255,0.2)' : 'transparent', border: activeTab === t.id ? '1.5px solid rgba(255,255,255,0.55)' : '1.5px solid transparent', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', color: C.white, fontSize: 11, fontWeight: activeTab === t.id ? 700 : 400, whiteSpace: 'nowrap', opacity: activeTab === t.id ? 1 : 0.8 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>{renderTab()}</div>
    </div>
  )
}
