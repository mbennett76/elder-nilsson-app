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
      { id:'1ne1', label:'1 Nefi 1', sublabel:'El principio del registro', verses:[
        { num:1, es:'Yo, Nefi, habiendo nacido de padres buenos, y habiendo recibido mucha instruccion de mi padre; y habiendo visto muchas aflicciones en el transcurso de mis dias; sin embargo habiendo sido muy favorecido del Senor en todos mis dias...', en:'I, Nephi, having been born of goodly parents, therefore I was taught somewhat in all the learning of my father; and having seen many afflictions in the course of my days, nevertheless, having been highly favored of the Lord in all my days...' },
        { num:2, es:'...si, teniendo un gran conocimiento de la bondad y los misterios de Dios, por tanto, quiero hacer un registro de mis procederes en mis dias.', en:'...yea, having had a great knowledge of the goodness and the mysteries of God, therefore I make a record of my proceedings in my days.' },
      ]},
      { id:'alma32', label:'Alma 32', sublabel:'La fe como semilla', verses:[
        { num:21, es:'Y ahora bien, como dije acerca de la fe, la fe no es tener un conocimiento perfecto de las cosas; por lo tanto, si teneis fe, esperais en cosas que no se ven, las cuales son verdaderas.', en:'And now as I said concerning faith — faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true.' },
        { num:28, es:'Ahora bien, compararemos la palabra con una semilla. Si dais lugar a que se siembre una semilla en vuestro corazon, si es una semilla verdadera, comenzara a hinchar vuestro pecho; y si no la expulsais, empezara a brotar.', en:'Now, we will compare the word unto a seed. Now, if ye give place, that a seed may be planted in your heart, behold, if it be a true seed, if ye do not cast it out by your unbelief, it will begin to swell within your breasts.' },
      ]},
    ]},
  { id:'nt', label:'Nuevo Testamento', sublabel:'El Evangelio de Jesucristo', icon:'✝️', color:C.red,
    chapters:[
      { id:'jn3', label:'Juan 3', sublabel:'El amor de Dios', verses:[
        { num:16, es:'Porque de tal manera amo Dios al mundo, que ha dado a su Hijo unigenito, para que todo aquel que en el cree, no se pierda, mas tenga vida eterna.', en:'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
        { num:17, es:'Porque no envio Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por el.', en:'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
      ]},
      { id:'mat28', label:'Mateo 28', sublabel:'La Gran Comision', verses:[
        { num:19, es:'Por tanto, id, y haced discipulos a todas las naciones, bautizandolos en el nombre del Padre, y del Hijo, y del Espiritu Santo;', en:'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:' },
        { num:20, es:'ensenandoles que guarden todas las cosas que os he mandado; y he aqui yo estoy con vosotros todos los dias, hasta el fin del mundo.', en:'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world.' },
      ]},
    ]},
  { id:'dyc', label:'Doctrina y Convenios', sublabel:'Revelacion Moderna', icon:'📘', color:C.green,
    chapters:[
      { id:'dyc18', label:'D y C 18', sublabel:'El valor de las almas', verses:[
        { num:10, es:'Recuerda que el valor de las almas es grande a los ojos de Dios;', en:'Remember the worth of souls is great in the sight of God;' },
        { num:11, es:'porque he aqui, el Senor tu Redentor sufrio la muerte en la carne; por lo tanto sufrio el dolor de todos los hombres para que todos los hombres pudieran arrepentirse y acudir a el.', en:'For, behold, the Lord your Redeemer suffered death in the flesh; wherefore he suffered the pain of all men, that all men might repent and come unto him.' },
        { num:15, es:'Y si sucede que te esfuerzas con todos los dias de tu vida en proclamar este arrepentimiento a esta gente, y traes aunque sea un alma a mi, cuan grande sera tu gozo con el en el reino de mi Padre!', en:'And if it so be that you should labor all your days in crying repentance unto this people, and bring, save it be one soul unto me, how great shall be your joy with him in the kingdom of my Father!' },
      ]},
    ]},
  { id:'pgp', label:'La Perla de Gran Precio', sublabel:'Escrituras Adicionales', icon:'💎', color:C.terra,
    chapters:[
      { id:'jose', label:'Jose Smith — Historia', sublabel:'La Primera Vision', verses:[
        { num:16, es:'Asi que, de acuerdo con mi determinacion de pedir a Dios, fui al bosque para hacer el intento. Era por la manana de un hermoso dia claro, a principios de la primavera de mil ochocientos veinte.', en:'So, in accordance with this, my determination to ask of God, I retired to the woods to make the attempt. It was on the morning of a beautiful, clear day, early in the spring of 1820.' },
        { num:17, es:'Vi una columna de luz exactamente sobre mi cabeza, mas brillante que el sol, la cual descendio gradualmente hasta posarse sobre mi.', en:'I saw a pillar of light exactly over my head, above the brightness of the sun, which descended gradually until it fell upon me.' },
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
