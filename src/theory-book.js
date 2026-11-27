/* ===== theory book: grammar chapters beyond the 12 tenses =====
   html — explanation; ex — [en, ru, uz]; err — [wrong, right, why]; quiz — [question, options, right index, why] */
const PARTS=['Времена','Предложение','Слова','Глагол','Сложные предложения'];
const CH_MORE=[
 {id:'seq',part:0,n:'Согласование времён',s:'Как пересказывать в прошлом',
  tip:'Если главный глагол в прошлом (said, thought, knew), время во второй части «сдвигается» на шаг назад.',
  html:`<p>По-русски мы говорим: «Он сказал, что <b>устал</b>» — и время не меняем. В английском после глагола в прошедшем времени (said, told, thought, knew, hoped) время в придаточной части обычно <b>сдвигается назад</b>.</p>
  <table><tr><th>Было (прямо)</th><th>Стало (после said)</th></tr>
  <tr><td>Present Simple: I <b>am</b> tired.</td><td>Past Simple: He said he <b>was</b> tired.</td></tr>
  <tr><td>Present Continuous: I <b>am working</b>.</td><td>Past Continuous: …he <b>was working</b>.</td></tr>
  <tr><td>Present Perfect: I <b>have finished</b>.</td><td>Past Perfect: …he <b>had finished</b>.</td></tr>
  <tr><td>Past Simple: I <b>saw</b> it.</td><td>Past Perfect: …he <b>had seen</b> it.</td></tr>
  <tr><td>will: I <b>will</b> help.</td><td>would: …he <b>would</b> help.</td></tr>
  <tr><td>can / may</td><td>could / might</td></tr></table>
  <p>Если главный глагол в настоящем (says, thinks), ничего не сдвигаем: <i>He says he is tired.</i></p>
  <p>Общеизвестные факты можно не сдвигать: <i>The teacher said that the Earth <b>goes</b> round the Sun.</i></p>`,
  ex:[['She said she was busy.','Она сказала, что занята.',"U band ekanini aytdi."],['I thought you were at home.','Я думал, что ты дома.',"Men seni uyda deb o'ylagandim."],['He told me he had lost his phone.','Он сказал мне, что потерял телефон.',"U menga telefonini yo'qotib qo'yganini aytdi."],['I knew you would come.','Я знал, что ты придёшь.',"Kelishingni bilardim."]],
  err:[['He said that he is tired.','He said that he was tired.','После said время сдвигается: is → was.'],['I thought you will help me.','I thought you would help me.','Will после прошедшего становится would.'],['She said she has seen it.','She said she had seen it.','Present Perfect → Past Perfect.']],
  quiz:[['He said he ___ hungry.',['is','was','will be'],1,'Said → сдвиг: is → was.'],['I knew she ___ come.',['will','would','can'],1,'Will → would.'],['They told me they ___ the film.',['had seen','have seen','see'],0,'Have seen → had seen.'],['She says she ___ tired.',['was','is','had been'],1,'Says — настоящее, сдвига нет.'],['I hoped you ___ help me.',['can','could','will'],1,'Can → could.']]},
 {id:'questions',part:1,n:'Вопросы и отрицания',s:'Вспомогательный глагол — ключ ко всему',
  tip:'Вопрос = вспомогательный глагол вперёд. Отрицание = not сразу после вспомогательного.',
  html:`<p>В русском вопрос можно задать одной интонацией: «Ты пьёшь чай?». В английском нужен <b>вспомогательный глагол</b> в начале: do, does, did, am / is / are, was / were, have / has, will, can…</p>
  <div class="fm">(Вопросительное слово) + вспомогательный + подлежащее + глагол?</div>
  <table><tr><th>Утверждение</th><th>Вопрос</th><th>Отрицание</th></tr>
  <tr><td>You like tea.</td><td><b>Do</b> you like tea?</td><td>You <b>don't</b> like tea.</td></tr>
  <tr><td>She works here.</td><td><b>Does</b> she work here?</td><td>She <b>doesn't</b> work here.</td></tr>
  <tr><td>They went home.</td><td><b>Did</b> they go home?</td><td>They <b>didn't</b> go home.</td></tr>
  <tr><td>He is busy.</td><td><b>Is</b> he busy?</td><td>He <b>isn't</b> busy.</td></tr>
  <tr><td>We can swim.</td><td><b>Can</b> we swim?</td><td>We <b>can't</b> swim.</td></tr></table>
  <h3>Вопросительные слова</h3>
  <p>what — что, who — кто, where — где / куда, when — когда, why — почему, how — как, how much / how many — сколько, which — который, whose — чей.</p>
  <p>Если вопрос к <b>подлежащему</b> (кто? что?), вспомогательный не нужен: <i>Who <b>called</b> you? What <b>happened</b>?</i></p>
  <h3>Короткие ответы</h3><p><i>Do you speak English? — Yes, I do. / No, I don't.</i> Отвечаем тем же вспомогательным глаголом.</p>`,
  ex:[['Where do you live?','Где ты живёшь?','Qayerda yashaysan?'],["She doesn't eat meat.",'Она не ест мясо.',"U go'sht yemaydi."],['Did you see the match?','Ты смотрел матч?',"O'yinni ko'rdingmi?"],['Who opened the window?','Кто открыл окно?','Derazani kim ochdi?'],['Why are you laughing?','Почему ты смеёшься?','Nega kulyapsan?']],
  err:[['You like tea?','Do you like tea?','Без вспомогательного глагола это не вопрос.'],['Where you live?','Where do you live?','После where нужен do / does.'],['Does she works?','Does she work?','После does — глагол без ‑s.'],['Who did call you?','Who called you?','Вопрос к подлежащему — без did.']],
  quiz:[['___ he speak English?',['Do','Does','Is'],1,'He → does.'],['Where ___ you go yesterday?',['did','do','were'],0,'Yesterday → did.'],["I ___ like this song.",["don't","doesn't","not"],0,'I → don\'t.'],['Who ___ this cake?',['did make','made','does made'],1,'Вопрос к подлежащему — без did.'],['___ they at home now?',['Do','Are','Is'],1,'They + сейчас без глагола → are.']]},
 {id:'order',part:1,n:'Порядок слов',s:'Кто — делает — что — где — когда',
  tip:'Английское предложение — как поезд: вагоны стоят строго по порядку. Подлежащее почти всегда перед глаголом.',
  html:`<p>В русском можно сказать «Я люблю чай», «Чай я люблю», «Люблю я чай». В английском порядок <b>твёрдый</b>, потому что окончаний почти нет и смысл держится на месте слова.</p>
  <div class="fm">Подлежащее + глагол + дополнение + место + время</div>
  <p><i>I <b>met</b> Akmal <b>at the station</b> <b>yesterday</b>.</i> — Кто? I. Что сделал? met. Кого? Akmal. Где? at the station. Когда? yesterday.</p>
  <h3>Наречия частоты</h3><p>always, usually, often, sometimes, never ставим <b>перед</b> обычным глаголом, но <b>после</b> am / is / are: <i>I <b>often</b> drink tea. She <b>is always</b> late.</i></p>
  <h3>Подлежащее обязательно</h3><p>По-русски: «Холодно», «Идёт дождь». По-английски нужно подлежащее: <i><b>It</b> is cold. <b>It</b> is raining.</i></p>
  <h3>Прилагательные — перед существительным</h3><p><i>a <b>big</b> house</i>, а не a house big.</p>`,
  ex:[['I usually have breakfast at seven.','Я обычно завтракаю в семь.',"Men odatda soat yettida nonushta qilaman."],['It is very hot today.','Сегодня очень жарко.',"Bugun juda issiq."],['She bought a red dress in the market.','Она купила красное платье на рынке.',"U bozordan qizil ko'ylak sotib oldi."],['We are never late.','Мы никогда не опаздываем.',"Biz hech qachon kechikmaymiz."]],
  err:[['Is cold today.','It is cold today.','Нужно подлежащее it.'],['I like very much tea.','I like tea very much.','Very much — в конце, после дополнения.'],['She always is late.','She is always late.','После is — наречие частоты.'],['Yesterday I at the station met Akmal.','Yesterday I met Akmal at the station.','Глагол сразу после подлежащего.']],
  quiz:[['Выбери верный порядок:',['I often play chess.','I play often chess.','Often I chess play.'],0,'Often — перед глаголом.'],['___ raining.',['Is','It is','It'],1,'Нужно подлежащее it.'],['She ___ tired.',['always is','is always','always'],1,'После is.'],['Выбери верный порядок:',['He speaks English well.','He speaks well English.','He well speaks English.'],0,'Well — после дополнения.'],['Выбери верный порядок:',['We met yesterday him.','We met him yesterday.','Yesterday met we him.'],1,'Кто — что сделал — кого — когда.']]},
 {id:'there',part:1,n:'There is / There are',s:'«Есть, находится» — когда что-то где-то есть',
  tip:'Говорим о том, что где-то ЕСТЬ что-то новое — начинаем с there is / there are.',
  html:`<p>Когда сообщаем, что где-то <b>есть</b> какой-то предмет, английское предложение начинают с <b>there is / there are</b>. Русский перевод обычно начинается с места: «В комнате есть стол» — <i>There is a table in the room.</i></p>
  <table><tr><th></th><th>Один / неисчисляемое</th><th>Много</th></tr>
  <tr><td>+</td><td>There <b>is</b> a cafe.</td><td>There <b>are</b> two cafes.</td></tr>
  <tr><td>−</td><td>There <b>isn't</b> any milk.</td><td>There <b>aren't</b> any chairs.</td></tr>
  <tr><td>?</td><td><b>Is there</b> a bank near here?</td><td><b>Are there</b> any shops?</td></tr></table>
  <p>Прошлое: <b>there was / there were</b>. Будущее: <b>there will be</b>. Present Perfect: <b>there has been / there have been</b>.</p>
  <p>Если предмет уже известен и мы говорим, <b>где</b> он, there не нужен: <i>The keys are on the table.</i></p>`,
  ex:[['There is a park near my house.','Рядом с моим домом есть парк.',"Uyim yaqinida park bor."],['There are thirty students in our group.','В нашей группе тридцать студентов.',"Guruhimizda o'ttizta talaba bor."],["There wasn't any bread at home.",'Дома не было хлеба.',"Uyda non yo'q edi."],['Will there be a test tomorrow?','Завтра будет тест?',"Ertaga test bo'ladimi?"]],
  err:[['In the room is a table.','There is a table in the room.','Новый предмет вводим через there is.'],['There is many people.','There are many people.','People — множественное число → are.'],['Is a bank near here?','Is there a bank near here?','Не теряй there в вопросе.'],['There have a cat.','There is a cat.','Не путай с have: there is / are.']],
  quiz:[['There ___ two banks on this street.',['is','are','be'],1,'Two banks → are.'],['___ there a pharmacy near here?',['Is','Are','Has'],0,'Pharmacy — одна → Is there.'],['There ___ a lot of snow last winter.',['was','were','is'],0,'Snow неисчисляемое, прошлое → was.'],['There ___ any milk in the fridge.',["isn't","aren't","don't"],0,'Milk неисчисляемое → isn\'t.'],['There ___ a concert tomorrow.',['will be','is be','will'],0,'Будущее → there will be.']]},
 {id:'articles',part:2,n:'Артикли',s:'a / an, the или ничего',
  tip:'A — «какой-то, один из», the — «тот самый». В русском артиклей нет, поэтому спрашивай себя: понятно ли, о чём именно речь?',
  html:`<p>В русском и узбекском артиклей нет, поэтому они кажутся лишними. Но для англичанина артикль — важная подсказка: речь о <b>каком-то</b> предмете или о <b>том самом</b>. Без артикля фраза звучит «сломанной», даже если всё остальное верно.</p>
  <div class="idea">
   <div><span class="tag ga">A / AN</span><b>«один, какой-то»</b><p>Произошёл от <i>one</i>. Предмет новый для слушателя или любой из многих. Только с исчисляемыми в единственном числе.</p><p class="ex1">I need a pen. — Мне нужна (какая-нибудь) ручка.</p></div>
   <div><span class="tag gt">THE</span><b>«тот самый»</b><p>Произошёл от <i>that</i>. Обоим понятно, о каком именно предмете речь. Можно с любыми существительными.</p><p class="ex1">Give me the pen. — Дай ту ручку (что на столе).</p></div>
   <div><span class="tag g0">—</span><b>без артикля</b><p>Мн. число и неисчисляемое «вообще», имена, города, языки, еда, спорт, дни — и когда уже есть my, this, some.</p><p class="ex1">I like pens. Water is life.</p></div>
  </div>
  <h3>Как выбрать: 4 вопроса по порядку</h3>
  <ol class="steps">
   <li><b>Перед словом уже есть my, your, this, that, some, any, no, число или чьё-то ’s?</b><br>→ Артикль не нужен. <i>my car, this bag, two apples, Akmal’s phone</i></li>
   <li><b>Это имя, город, страна, язык, день недели, месяц, приём пищи, спорт?</b><br>→ Обычно без артикля. <i>Tashkent, English, on Monday, breakfast, football</i></li>
   <li><b>Слушателю понятно, какой именно предмет?</b> Его уже упоминали, он единственный, есть уточнение, или это «самый / первый / последний».<br>→ <b>the</b>. <i>the sun, the best, the man in black</i></li>
   <li><b>Нет — предмет новый или любой.</b><br>→ Один исчисляемый: <b>a / an</b>. Много или неисчисляемое: <b>без артикля</b>. <i>a car → cars → water</i></li>
  </ol>
  <h3>A или AN?</h3>
  <p>Решает первый <b>звук</b> следующего слова, а не буква.</p>
  <table><tr><th>AN — перед гласным звуком</th><th>A — перед согласным звуком</th></tr>
   <tr><td>an apple, an egg</td><td>a car, a dog</td></tr>
   <tr><td>an hour <small>(h не читается)</small></td><td>a house <small>(h читается)</small></td></tr>
   <tr><td>an umbrella, an uncle</td><td>a university <small>(звук «ю»)</small></td></tr>
   <tr><td>an old car</td><td>a big apple</td></tr></table>
  <h3>Все правила</h3><p class="note">Нажми «Тренировать», чтобы получать задания только на это правило.</p>
  <div data-rules></div>
  <h3>Сравни пары</h3>
  <table><tr><th>Так</th><th>И так</th><th>Разница</th></tr>
   <tr><td>I have <b>a</b> car.</td><td><b>The</b> car is red.</td><td>впервые → уже знаем</td></tr>
   <tr><td>I like cats.</td><td><b>The</b> cats in our yard are noisy.</td><td>вообще → конкретные</td></tr>
   <tr><td>play football</td><td>play <b>the</b> piano</td><td>спорт → инструмент</td></tr>
   <tr><td>go to school</td><td>go to <b>the</b> school</td><td>учиться → прийти в здание</td></tr>
   <tr><td>next week</td><td><b>the</b> next day</td><td>от сегодня → от события в рассказе</td></tr></table>`,
  ex:[['I saw a dog in the park. The dog was very big.','Я видел собаку в парке. Собака была очень большая.',"Parkda it ko'rdim. It juda katta edi."],['My sister is a doctor.','Моя сестра — врач.','Opam shifokor.'],['The sun is very hot today.','Солнце сегодня очень жаркое.','Bugun quyosh juda issiq.'],['We play football on Sundays.','Мы играем в футбол по воскресеньям.',"Biz yakshanba kunlari futbol o'ynaymiz."],['She plays the piano.','Она играет на пианино.','U pianino chaladi.']],
  err:[['I have car.','I have a car.','Исчисляемое в ед. числе не бывает «голым».'],['She is doctor.','She is a doctor.','Профессия — с a / an.'],['The Tashkent is big.','Tashkent is big.','Города без артикля.'],['an university','a university','Звук «ю» — согласный.'],['the my friend','my friend','Два определителя подряд не ставят.']],
  quiz:[['I need ___ umbrella.',['a','an','the'],1,'Umbrella начинается с гласного звука.'],['___ moon is beautiful tonight.',['A','The','—'],1,'Луна одна — the.'],['My father is ___ engineer.',['a','an','the'],1,'Профессия, гласный звук → an.'],['We live in ___ Tashkent.',['the','a','— (ничего)'],2,'Города без артикля.'],['This is ___ best plov in the city.',['a','the','—'],1,'Самый — the.']]},
 {id:'nouns',part:2,n:'Существительные',s:'Множественное число, исчисляемые и неисчисляемые',
  tip:'Сначала спроси: можно ли это посчитать — одна, две, три? От ответа зависит a, many / much и форма глагола.',
  html:`<h3>Множественное число</h3>
  <table><tr><th>Правило</th><th>Пример</th></tr>
  <tr><td>Обычно + <b>s</b></td><td>book → books, car → cars</td></tr>
  <tr><td>После s, ss, sh, ch, x, o + <b>es</b></td><td>bus → buses, watch → watches, box → boxes, tomato → tomatoes</td></tr>
  <tr><td>Согласная + y → <b>ies</b></td><td>city → cities, baby → babies (но day → days)</td></tr>
  <tr><td>f / fe → <b>ves</b></td><td>knife → knives, leaf → leaves</td></tr>
  <tr><td>Особые слова</td><td>man → men, woman → women, child → children, person → people, foot → feet, tooth → teeth, mouse → mice</td></tr></table>
  <h3>Исчисляемые и неисчисляемые</h3>
  <p><b>Исчисляемые</b> можно посчитать: an apple, two apples. <b>Неисчисляемые</b> — вещества и понятия: water, sugar, money, bread, information, advice, news, furniture, homework. У них нет a / an и множественного числа, глагол — как с it: <i>The news <b>is</b> good.</i></p>
  <table><tr><th></th><th>Исчисляемые</th><th>Неисчисляемые</th></tr>
  <tr><td>много</td><td>many books</td><td>much water</td></tr>
  <tr><td>мало</td><td>a few books</td><td>a little water</td></tr>
  <tr><td>сколько?</td><td>How many books?</td><td>How much water?</td></tr>
  <tr><td>в любом случае</td><td colspan="2">a lot of books / a lot of water, some, any</td></tr></table>
  <p>Чтобы посчитать неисчисляемое, добавляем «упаковку»: <i>a cup of tea, a piece of bread, a bottle of water, a piece of advice.</i></p>
  <h3>Притяжательный падеж</h3><p><i>Akmal’s car</i> — машина Акмала. Во множественном числе на ‑s — только апостроф: <i>my parents’ house.</i></p>`,
  ex:[['I bought three kilos of tomatoes.','Я купил три килограмма помидоров.',"Uch kilo pomidor sotib oldim."],['How much money do you need?','Сколько денег тебе нужно?',"Senga qancha pul kerak?"],['The children are playing outside.','Дети играют на улице.',"Bolalar tashqarida o'ynayapti."],['Can you give me a piece of advice?','Можешь дать мне совет?',"Menga bir maslahat bera olasanmi?"],["This is my brother's room.",'Это комната моего брата.',"Bu akamning xonasi."]],
  err:[['two childs','two children','Child — особое слово.'],['an information','some information','Information неисчисляемое.'],['How many money?','How much money?','Money неисчисляемое → much.'],['The news are good.','The news is good.','News — неисчисляемое, глагол как с it.'],['many furnitures','a lot of furniture','Furniture не имеет множественного числа.']],
  quiz:[['I have two ___.',['childs','children','childrens'],1,'Child → children.'],['How ___ sugar do you want?',['many','much','few'],1,'Sugar неисчисляемое.'],['There are many ___ in the street.',['peoples','people','persons'],1,'Person → people.'],['Can I have ___ bread?',['a','some','many'],1,'Bread неисчисляемое → some.'],['I have ___ friends in London.',['a little','a few','much'],1,'Friends исчисляемые → a few.']]},
 {id:'pronouns',part:2,n:'Местоимения',s:'I — me — my — mine — myself',
  tip:'У одного «я» пять форм. Подлежащее — I, после глагола — me, перед словом — my, без слова — mine.',
  html:`<table><tr><th>Кто делает</th><th>Кого / кому</th><th>Чей + слово</th><th>Чей (без слова)</th><th>Сам</th></tr>
  <tr><td>I</td><td>me</td><td>my</td><td>mine</td><td>myself</td></tr>
  <tr><td>you</td><td>you</td><td>your</td><td>yours</td><td>yourself</td></tr>
  <tr><td>he</td><td>him</td><td>his</td><td>his</td><td>himself</td></tr>
  <tr><td>she</td><td>her</td><td>her</td><td>hers</td><td>herself</td></tr>
  <tr><td>it</td><td>it</td><td>its</td><td>—</td><td>itself</td></tr>
  <tr><td>we</td><td>us</td><td>our</td><td>ours</td><td>ourselves</td></tr>
  <tr><td>they</td><td>them</td><td>their</td><td>theirs</td><td>themselves</td></tr></table>
  <p><b>Подлежащее</b> — перед глаголом: <i><b>She</b> loves him.</i> <b>Объект</b> — после глагола или предлога: <i>He loves <b>her</b>. Come with <b>me</b>.</i></p>
  <p><b>my / your</b> стоят перед существительным: <i>my book</i>. <b>mine / yours</b> заменяют его: <i>This book is <b>mine</b>.</i></p>
  <p>В узбекском и русском «он / она» различаются так же, но в английском <b>it</b> — для предметов и животных, а <b>they</b> — для всех во множественном числе.</p>
  <h3>Some / any / no</h3><p><b>some</b> — в утверждении, <b>any</b> — в вопросе и отрицании, <b>no</b> = not any: <i>I have some time. Do you have any time? I have no time.</i> То же с somebody / anybody / nobody, something / anything / nothing.</p>`,
  ex:[['Can you help me?','Можешь мне помочь?',"Menga yordam bera olasanmi?"],['This phone is mine, not yours.','Этот телефон мой, а не твой.',"Bu telefon meniki, seniki emas."],['She made the cake herself.','Она испекла торт сама.',"U tortni o'zi pishirdi."],['I told them about our plans.','Я рассказал им о наших планах.',"Ularga rejalarimiz haqida aytdim."],['Is there anything in the box?','В коробке что-нибудь есть?',"Qutida biror narsa bormi?"]],
  err:[['Me and Akmal went home.','Akmal and I went home.','Подлежащее — I; вежливо ставить себя вторым.'],['This is my.','This is mine.','Без существительного — mine.'],['I love she.','I love her.','После глагола — объектная форма.'],['The dog wagged it\'s tail.','The dog wagged its tail.','Its — «его», it\'s = it is.'],["I don't have nothing.","I don't have anything.",'Двойное отрицание нельзя.']],
  quiz:[['Give ___ the book, please.',['I','me','my'],1,'После глагола — me.'],['Is this bag ___?',['your','yours','you'],1,'Без существительного — yours.'],['___ are my best friends.',['Them','They','Their'],1,'Подлежащее — they.'],['He hurt ___ when he fell.',['him','himself','his'],1,'Сам себя — himself.'],["I don't have ___ questions.",['some','any','no'],1,'Отрицание → any.']]},
 {id:'adj',part:2,n:'Прилагательные и степени сравнения',s:'big — bigger — the biggest',
  tip:'Короткое слово — добавь ‑er / ‑est. Длинное — поставь more / the most. И запомни: good — better — the best.',
  html:`<p>Прилагательные в английском <b>не меняются</b> по родам и числам: <i>a big house, big houses, a big car.</i> Ставим их <b>перед</b> существительным.</p>
  <table><tr><th>Слово</th><th>Сравнительная</th><th>Превосходная</th></tr>
  <tr><td>Короткие: cheap</td><td>cheap<b>er</b> (than)</td><td>the cheap<b>est</b></td></tr>
  <tr><td>На ‑e: nice</td><td>nice<b>r</b></td><td>the nice<b>st</b></td></tr>
  <tr><td>Согл.‑гл.‑согл.: big</td><td>big<b>ger</b></td><td>the big<b>gest</b></td></tr>
  <tr><td>На ‑y: happy</td><td>happ<b>ier</b></td><td>the happ<b>iest</b></td></tr>
  <tr><td>Длинные: expensive</td><td><b>more</b> expensive</td><td><b>the most</b> expensive</td></tr>
  <tr><td>good / bad / far</td><td>better / worse / further</td><td>the best / the worst / the furthest</td></tr></table>
  <p>Сравниваем через <b>than</b>: <i>Tashkent is bigger <b>than</b> Bukhara.</i> «Такой же, как» — <b>as … as</b>: <i>He is as tall as his father.</i> «Не такой, как» — <i>not as … as.</i></p>
  <p>Порядок нескольких прилагательных: мнение → размер → возраст → цвет → материал: <i>a beautiful big old red wooden door.</i></p>
  <h3>‑ed и ‑ing</h3><p><i>I am <b>bored</b></i> (мне скучно) — <i>The film is <b>boring</b></i> (фильм скучный). ‑ed — что я чувствую, ‑ing — что вызывает чувство.</p>`,
  ex:[['My brother is taller than me.','Мой брат выше меня.',"Akam mendan baland."],['This is the most interesting book I have read.','Это самая интересная книга, которую я читал.',"Bu men o'qigan eng qiziqarli kitob."],['Today is worse than yesterday.','Сегодня хуже, чем вчера.',"Bugun kechagidan yomonroq."],['She is as clever as her sister.','Она такая же умная, как её сестра.',"U opasi kabi aqlli."],['I was bored at the lesson.','Мне было скучно на уроке.',"Darsda zerikdim."]],
  err:[['more cheaper','cheaper','Не смешивай more и ‑er.'],['the most good','the best','Good — особое слово.'],['bigger then','bigger than','Сравнение — than (не then).'],['I am boring.','I am bored.','Чувствую скуку — bored.'],['a house big','a big house','Прилагательное перед существительным.']],
  quiz:[['A plane is ___ than a car.',['fast','faster','fastest'],1,'Сравнение двух — ‑er.'],['This is ___ day of my life!',['the happiest','the happier','happiest'],0,'Превосходная степень — the ‑est.'],['Gold is ___ than silver.',['expensiver','more expensive','most expensive'],1,'Длинное слово — more.'],['My English is ___ than last year.',['gooder','better','more good'],1,'Good → better.'],['The film was very ___.',['interested','interesting','interest'],1,'Фильм вызывает интерес — interesting.']]},
 {id:'adv',part:2,n:'Наречия',s:'Как, как часто, где и когда',
  tip:'Прилагательное описывает предмет (a quick answer), наречие — действие (answer quickly). Чаще всего это ‑ly.',
  html:`<p>Наречие отвечает на вопросы <b>как? как часто? насколько?</b> и описывает глагол, прилагательное или всё предложение.</p>
  <table><tr><th>Прилагательное</th><th>Наречие</th></tr>
  <tr><td>slow — медленный</td><td>slow<b>ly</b> — медленно</td></tr>
  <tr><td>careful</td><td>careful<b>ly</b></td></tr>
  <tr><td>easy</td><td>eas<b>ily</b></td></tr>
  <tr><td>good — хороший</td><td><b>well</b> — хорошо</td></tr>
  <tr><td>fast, hard, late, early</td><td>fast, hard, late, early <small>(не меняются)</small></td></tr></table>
  <p>Осторожно: <b>hardly</b> = «едва», а не «усердно»; <b>lately</b> = «в последнее время».</p>
  <h3>Наречия частоты</h3>
  <p>always (всегда) → usually → often → sometimes → rarely → never (никогда). Ставим перед глаголом, но после am / is / are: <i>I <b>usually</b> walk. He <b>is never</b> late.</i></p>
  <h3>Степени сравнения</h3><p>Наречия на ‑ly: <i>more slowly, the most carefully.</i> Короткие: <i>faster, harder.</i> Особые: <i>well → better → best, badly → worse → worst.</i></p>`,
  ex:[['She speaks English very well.','Она очень хорошо говорит по-английски.',"U inglizcha juda yaxshi gapiradi."],['Please drive carefully.','Пожалуйста, веди машину осторожно.',"Iltimos, ehtiyot bo'lib hayda."],['I rarely watch TV.','Я редко смотрю телевизор.',"Men kamdan-kam televizor ko'raman."],['He works hard every day.','Он усердно работает каждый день.',"U har kuni qattiq ishlaydi."]],
  err:[['She speaks English very good.','She speaks English very well.','«Хорошо» о действии — well.'],['He drives careful.','He drives carefully.','Описываем действие — наречие.'],['I work hardly.','I work hard.','Hardly = «едва».'],['I go often to the gym.','I often go to the gym.','Often — перед глаголом.']],
  quiz:[['He sings very ___.',['good','well','nice'],1,'Описываем действие — well.'],['Please speak ___.',['slow','slowly','slowness'],1,'Как говорить? — slowly.'],['She ___ late for work.',['is never','never is','never'],0,'После is.'],['They worked ___ all day.',['hardly','hard','harder'],1,'Усердно — hard.'],['He answered the question ___.',['easy','easily','easier'],1,'Как ответил? — easily.']]},
 {id:'prep',part:2,n:'Предлоги времени и места',s:'at, on, in — от точки к большому',
  tip:'Представь пирамиду: at — точка, on — поверхность, in — большое пространство. Для времени — то же самое.',
  html:`<h3>Время</h3>
  <table><tr><th>at — точное время</th><th>on — день, дата</th><th>in — длинный период</th></tr>
  <tr><td>at 7 o'clock<br>at noon, at night<br>at the weekend</td><td>on Monday<br>on 5 May<br>on my birthday</td><td>in May, in 2024<br>in summer<br>in the morning</td></tr></table>
  <p>Без предлога: <i>today, tomorrow, yesterday, next week, last year, this morning.</i></p>
  <p><b>for</b> — в течение (for two hours), <b>since</b> — с момента (since Monday), <b>during</b> — во время (during the lesson), <b>by</b> — к (by five), <b>until</b> — до (until five), <b>ago</b> — назад, ставится после: <i>two days ago.</i></p>
  <h3>Место</h3>
  <table><tr><th>at — точка</th><th>on — поверхность</th><th>in — внутри</th></tr>
  <tr><td>at the bus stop<br>at home, at work<br>at the door</td><td>on the table<br>on the wall<br>on the second floor</td><td>in the box<br>in the room<br>in Tashkent</td></tr></table>
  <p>Ещё: <b>under</b> — под, <b>above</b> — над, <b>next to</b> — рядом с, <b>between</b> — между (двумя), <b>behind</b> — позади, <b>in front of</b> — перед, <b>opposite</b> — напротив, <b>near</b> — близко.</p>
  <h3>Движение</h3><p><b>to</b> — куда (go to school), <b>into</b> — внутрь, <b>from</b> — откуда, <b>through</b> — сквозь, <b>across</b> — через (дорогу). Но: <i>go home</i> — без to.</p>`,
  ex:[['The lesson starts at nine.','Урок начинается в девять.',"Dars soat to'qqizda boshlanadi."],['My birthday is on the tenth of June.','Мой день рождения десятого июня.',"Tug'ilgan kunim o'ninchi iyunda."],['We met in 2019.','Мы познакомились в 2019 году.',"Biz 2019-yilda tanishganmiz."],['The keys are on the table next to the phone.','Ключи на столе рядом с телефоном.',"Kalitlar stol ustida, telefon yonida."],['She is waiting at the bus stop.','Она ждёт на остановке.',"U bekatda kutyapti."]],
  err:[['in Monday','on Monday','Дни недели — on.'],['at 2020','in 2020','Годы — in.'],['on the morning','in the morning','Части дня — in (но at night).'],['I go to home.','I go home.','Home после go — без to.'],['since two hours','for two hours','Отрезок — for.']],
  quiz:[['I was born ___ 2005.',['in','on','at'],0,'Год — in.'],['See you ___ Friday!',['in','on','at'],1,'День недели — on.'],['The film starts ___ 8 pm.',['in','on','at'],2,'Точное время — at.'],['The picture is ___ the wall.',['in','on','at'],1,'Поверхность — on.'],["I've lived here ___ 2015.",['for','since','from'],1,'С момента — since.']]},
 {id:'modals',part:3,n:'Модальные глаголы',s:'can, must, should, may, have to',
  tip:'После модального глагола — просто глагол, без to и без ‑s: she can swim, he must go.',
  html:`<p>Модальные глаголы показывают <b>отношение</b> к действию: могу, должен, стоит, можно. Они особые: не меняются по лицам, не берут do в вопросах, после них — глагол без to.</p>
  <div class="fm">S + модальный + V (без to) · Вопрос: модальный + S + V?</div>
  <table><tr><th>Глагол</th><th>Значение</th><th>Пример</th></tr>
  <tr><td><b>can / can't</b></td><td>умею, могу, можно</td><td>I can swim. Can I come in?</td></tr>
  <tr><td><b>could</b></td><td>мог (в прошлом), вежливая просьба</td><td>Could you help me?</td></tr>
  <tr><td><b>must</b></td><td>должен (сам так считаю), строгое правило</td><td>I must call Mom.</td></tr>
  <tr><td><b>mustn't</b></td><td>нельзя!</td><td>You mustn't smoke here.</td></tr>
  <tr><td><b>have to</b></td><td>приходится (так требуют обстоятельства)</td><td>I have to work on Saturday.</td></tr>
  <tr><td><b>don't have to</b></td><td>не обязательно</td><td>You don't have to come.</td></tr>
  <tr><td><b>should</b></td><td>следует, совет</td><td>You should sleep more.</td></tr>
  <tr><td><b>may / might</b></td><td>возможно; можно (вежливо)</td><td>It might rain. May I sit here?</td></tr></table>
  <p>Важно: <b>mustn't</b> = нельзя, а <b>don't have to</b> = можно не делать. В прошлом вместо must используют <b>had to</b>, вместо can — <b>could</b> или <b>was able to</b>.</p>`,
  ex:[['Can you open the window, please?','Можешь открыть окно, пожалуйста?',"Iltimos, derazani ocha olasanmi?"],['You should drink more water.','Тебе следует пить больше воды.',"Ko'proq suv ichishing kerak."],['We have to wear a uniform at school.','В школе нам приходится носить форму.',"Maktabda forma kiyishimiz shart."],["You mustn't use your phone during the exam.",'Во время экзамена нельзя пользоваться телефоном.',"Imtihon paytida telefondan foydalanish mumkin emas."],['It might snow tonight.','Сегодня ночью, возможно, пойдёт снег.',"Bugun kechasi qor yog'ishi mumkin."]],
  err:[['She can to swim.','She can swim.','После модального — без to.'],['He musts go.','He must go.','Модальные не берут ‑s.'],['Do you can help?','Can you help?','Вопрос без do.'],['I must went.','I had to go.','В прошлом — had to + V.'],["You mustn't come (= не обязательно).","You don't have to come.",'«Не обязательно» — don\'t have to.']],
  quiz:[['___ you speak Chinese?',['Do','Can','Are'],1,'Умеешь? — can.'],['You look tired. You ___ go to bed.',['should','can','may'],0,'Совет — should.'],['Yesterday I ___ work late.',['must','had to','have to'],1,'Прошлое — had to.'],["It's Sunday, you ___ get up early.",["mustn't","don't have to","can't"],1,'Не обязательно — don\'t have to.'],['___ I use your pen?',['May','Must','Should'],0,'Вежливая просьба разрешения — may.']]},
 {id:'passive',part:3,n:'Пассивный залог',s:'Действие важнее того, кто его сделал',
  tip:'Пассив — это to be в нужном времени + V3. Кто сделал — через by, но часто его вообще не называют.',
  html:`<p>Активный залог: <i>Someone <b>stole</b> my bike.</i> — важно, кто сделал. Пассивный: <i>My bike <b>was stolen</b>.</i> — важно, что случилось с предметом. По-русски: «Велосипед украли», «Дом построен в 1990 году».</p>
  <div class="fm">Объект + to be (в нужном времени) + V3 (+ by …)</div>
  <table><tr><th>Время</th><th>Пассив</th></tr>
  <tr><td>Present Simple</td><td>English <b>is spoken</b> here.</td></tr>
  <tr><td>Past Simple</td><td>The house <b>was built</b> in 1990.</td></tr>
  <tr><td>Future Simple</td><td>The results <b>will be announced</b> tomorrow.</td></tr>
  <tr><td>Present Continuous</td><td>The road <b>is being repaired</b>.</td></tr>
  <tr><td>Present Perfect</td><td>My car <b>has been washed</b>.</td></tr>
  <tr><td>с модальными</td><td>It <b>must be done</b> today.</td></tr></table>
  <p>Кто сделал — через <b>by</b>: <i>The book was written <b>by</b> Navoi.</i> Если исполнитель неважен или неизвестен, by не нужен.</p>`,
  ex:[['This bridge was built in 1965.','Этот мост построили в 1965 году.',"Bu ko'prik 1965-yilda qurilgan."],['Plov is cooked in a big kazan.','Плов готовят в большом казане.',"Palov katta qozonda pishiriladi."],['The letter will be sent tomorrow.','Письмо отправят завтра.',"Xat ertaga yuboriladi."],['My phone has been stolen!','У меня украли телефон!',"Telefonimni o'g'irlab ketishdi!"],['The room is being cleaned now.','Комнату сейчас убирают.',"Xona hozir tozalanyapti."]],
  err:[['The house built in 1990.','The house was built in 1990.','Без to be это не пассив.'],['English is speak here.','English is spoken here.','Нужна третья форма.'],['It was written from Navoi.','It was written by Navoi.','Исполнитель — через by.'],['The road is repairing.','The road is being repaired.','Дорогу ремонтируют — пассив.']],
  quiz:[['The Mona Lisa ___ by Leonardo.',['painted','was painted','is painting'],1,'Past Simple Passive.'],['Rice ___ in many countries.',['is grown','grows by','is growing'],0,'Present Simple Passive.'],['The work will ___ tomorrow.',['finish','be finished','finished'],1,'Future Passive — will be + V3.'],['My bag ___ stolen!',['has been','has','have been'],0,'Present Perfect Passive.'],['The new school is ___ built now.',['been','being','be'],1,'Present Continuous Passive — is being + V3.']]},
 {id:'gerund',part:3,n:'Герундий и инфинитив',s:'doing или to do?',
  tip:'После одних глаголов — ‑ing (enjoy, finish, mind), после других — to (want, decide, hope). Учи их парами с глаголом.',
  html:`<p><b>Герундий</b> — глагол с ‑ing в роли существительного: <i><b>Swimming</b> is good for you.</i> <b>Инфинитив</b> — to + глагол: <i>I want <b>to swim</b>.</i></p>
  <table><tr><th>После этих — ‑ing</th><th>После этих — to + V</th></tr>
  <tr><td>enjoy, finish, mind, avoid, keep, stop, miss, practise, suggest, can't stand</td><td>want, would like, decide, hope, plan, promise, agree, refuse, learn, need</td></tr></table>
  <p>После <b>предлогов</b> — всегда ‑ing: <i>I'm good <b>at drawing</b>. Thank you <b>for helping</b>. I'm interested <b>in learning</b>.</i></p>
  <p>Цель «чтобы» — to: <i>I went to the shop <b>to buy</b> bread.</i></p>
  <h3>Меняется смысл</h3>
  <table><tr><td>stop <b>smoking</b></td><td>бросить курить</td></tr><tr><td>stop <b>to smoke</b></td><td>остановиться, чтобы покурить</td></tr>
  <tr><td>remember <b>locking</b></td><td>помнить, что запер</td></tr><tr><td>remember <b>to lock</b></td><td>не забыть запереть</td></tr></table>
  <p>Like, love, hate, start, begin — можно и так, и так: <i>I like reading / I like to read.</i></p>`,
  ex:[['I enjoy cooking for my family.','Я люблю готовить для семьи.',"Oilam uchun ovqat pishirishni yaxshi ko'raman."],['She decided to learn Korean.','Она решила выучить корейский.',"U koreys tilini o'rganishga qaror qildi."],['Thank you for helping me.','Спасибо, что помог мне.',"Menga yordam berganing uchun rahmat."],['I came here to see you.','Я пришёл сюда, чтобы увидеть тебя.',"Bu yerga seni ko'rgani keldim."],["Don't forget to call Grandma.",'Не забудь позвонить бабушке.',"Buvimga qo'ng'iroq qilishni unutma."]],
  err:[['I enjoy to read.','I enjoy reading.','После enjoy — ‑ing.'],['I want going home.','I want to go home.','После want — to.'],['I came here for see you.','I came here to see you.','«Чтобы» — to.'],['She is good at draw.','She is good at drawing.','После предлога — ‑ing.']],
  quiz:[['I finished ___ the book.',['to read','reading','read'],1,'After finish — ‑ing.'],['We decided ___ a taxi.',['taking','to take','take'],1,'After decide — to.'],['Would you mind ___ the window?',['opening','to open','open'],0,'After mind — ‑ing.'],["I'm interested in ___ languages.",['learn','to learn','learning'],2,'После предлога — ‑ing.'],['He went to the bank ___ money.',['to get','getting','for get'],0,'Цель — to.']]},
 {id:'phrasal',part:3,n:'Основные фразовые глаголы',s:'get up, look for, give up и другие',
  tip:'Фразовый глагол = глагол + маленькое слово (up, on, off…). Вместе они дают новый смысл — учи их целиком, как одно слово.',
  html:`<p>Маленькая частица полностью меняет смысл: <i>look</i> — смотреть, <i>look for</i> — искать, <i>look after</i> — присматривать. Вот самые нужные:</p>
  <table><tr><th>Глагол</th><th>Значение</th><th>Пример</th></tr>
  <tr><td>get up</td><td>вставать</td><td>I get up at 7.</td></tr>
  <tr><td>wake up</td><td>просыпаться</td><td>I woke up late.</td></tr>
  <tr><td>turn on / off</td><td>включить / выключить</td><td>Turn off the light.</td></tr>
  <tr><td>put on / take off</td><td>надеть / снять</td><td>Take off your shoes.</td></tr>
  <tr><td>look for</td><td>искать</td><td>I'm looking for my keys.</td></tr>
  <tr><td>look after</td><td>заботиться, присматривать</td><td>She looks after her brother.</td></tr>
  <tr><td>find out</td><td>узнать, выяснить</td><td>Find out the time.</td></tr>
  <tr><td>give up</td><td>бросить, сдаться</td><td>Don't give up!</td></tr>
  <tr><td>go on</td><td>продолжать</td><td>Go on, please.</td></tr>
  <tr><td>come back</td><td>вернуться</td><td>Come back soon.</td></tr>
  <tr><td>pick up</td><td>поднять; забрать</td><td>I'll pick you up at 6.</td></tr>
  <tr><td>run out of</td><td>закончиться (о запасе)</td><td>We ran out of milk.</td></tr>
  <tr><td>get on with</td><td>ладить с</td><td>I get on well with my boss.</td></tr>
  <tr><td>set up</td><td>основать, настроить</td><td>He set up a company.</td></tr>
  <tr><td>fill in</td><td>заполнить</td><td>Fill in the form.</td></tr></table>
  <p>С существительным частицу можно ставить до или после: <i>turn off the TV / turn the TV off.</i> С местоимением — только между: <i>turn <b>it</b> off</i>.</p>`,
  ex:[['I usually get up at half past six.','Я обычно встаю в половине седьмого.',"Odatda soat oltiyarimda turaman."],['Can you turn off the TV?','Можешь выключить телевизор?',"Televizorni o'chira olasanmi?"],["I'm looking for a new job.",'Я ищу новую работу.',"Yangi ish qidiryapman."],["Don't give up — you can do it!",'Не сдавайся — у тебя получится!',"Taslim bo'lma — sen uddalaysan!"],['Grandma looks after the children.','Бабушка присматривает за детьми.',"Buvim bolalarga qaraydi."]],
  err:[['Turn off it.','Turn it off.','С местоимением — между глаголом и частицей.'],['I look my keys.','I am looking for my keys.','Искать — look for.'],['Wake on!','Wake up!','Просыпаться — wake up.'],['Put off your coat.','Take off your coat.','Снять — take off (put off = отложить).']],
  quiz:[['Please ___ your shoes before you come in.',['take off','put on','turn off'],0,'Снять — take off.'],['I\'m ___ my glasses. Have you seen them?',['looking after','looking for','looking at'],1,'Искать — look for.'],["It's dark. ___ the light, please.",['Turn on','Turn off','Give up'],0,'Включить — turn on.'],["Don't ___! Try again.",['give up','get up','pick up'],0,'Не сдавайся — give up.'],["We've ___ of bread. Can you buy some?",['run out','run off','run up'],0,'Закончилось — run out of.']]},
 {id:'usedto',part:3,n:'Used to',s:'Как было раньше, но уже не так',
  tip:'Used to + глагол — «раньше было так, а теперь нет». Только о прошлом!',
  html:`<p><b>Used to</b> рассказывает о привычках и состояниях в прошлом, которых <b>больше нет</b>: <i>I <b>used to</b> live in Samarkand</i> (а теперь живу в другом месте).</p>
  <table><tr><td>+</td><td>I <b>used to</b> play football.</td></tr>
  <tr><td>−</td><td>I <b>didn't use to</b> like coffee.</td></tr>
  <tr><td>?</td><td><b>Did</b> you <b>use to</b> wear glasses?</td></tr></table>
  <p>В вопросе и отрицании пишется <b>use to</b> (без d), потому что прошлое уже показывает did.</p>
  <h3>Не путай</h3>
  <p><b>be used to + ‑ing</b> — «привык к»: <i>I <b>am used to getting</b> up early.</i></p>
  <p><b>get used to + ‑ing</b> — «привыкать»: <i>I'm <b>getting used to</b> the cold weather.</i></p>
  <p>Для настоящих привычек used to не бывает — используем Present Simple с usually: <i>I usually drink tea.</i></p>`,
  ex:[['I used to live in Bukhara.','Раньше я жил в Бухаре.',"Ilgari Buxoroda yashardim."],["She didn't use to like vegetables.",'Раньше она не любила овощи.',"Ilgari u sabzavotlarni yoqtirmasdi."],['Did you use to play the dutar?','Ты раньше играл на дутаре?',"Ilgari dutor chalarmiding?"],["I'm used to working at night.",'Я привык работать ночью.',"Kechasi ishlashga o'rganib qolganman."]],
  err:[['I use to live here.','I used to live here.','В утверждении — used.'],["I didn't used to smoke.","I didn't use to smoke.",'После did — use.'],['I am used to get up early.','I am used to getting up early.','Be used to + ‑ing.'],['I used to go to the gym now.','I usually go to the gym.','О настоящем used to не говорят.']],
  quiz:[['When I was young, I ___ climb trees.',['use to','used to','am used to'],1,'Привычка в прошлом — used to.'],['___ you use to have long hair?',['Do','Did','Were'],1,'Вопрос — Did… use to.'],["He didn't ___ like school.",['used to','use to','using to'],1,'После did — use to.'],["I'm used to ___ in a big city.",['live','living','lived'],1,'Be used to + ‑ing.'],['We ___ to go there every summer.',['used','use','are used'],0,'Used to + V.']]},
 {id:'cond',part:4,n:'Условные предложения 0–3',s:'Если… то…',
  tip:'Тип зависит от того, насколько это реально: всегда (0), возможно (1), мечта (2), уже поздно (3).',
  html:`<table><tr><th>Тип</th><th>Если (if)</th><th>То</th><th>Смысл</th></tr>
  <tr><td><b>0</b></td><td>Present Simple</td><td>Present Simple</td><td>всегда так, факт</td></tr>
  <tr><td><b>1</b></td><td>Present Simple</td><td>will + V</td><td>реально в будущем</td></tr>
  <tr><td><b>2</b></td><td>Past Simple</td><td>would + V</td><td>нереально сейчас, мечта</td></tr>
  <tr><td><b>3</b></td><td>Past Perfect</td><td>would have + V3</td><td>нереально в прошлом, сожаление</td></tr></table>
  <p><b>0:</b> <i>If you heat ice, it melts.</i> — Если нагреть лёд, он тает.</p>
  <p><b>1:</b> <i>If it rains, we will stay at home.</i> — Если пойдёт дождь, мы останемся дома. После if — <b>никакого will</b>.</p>
  <p><b>2:</b> <i>If I had a lot of money, I would buy a house.</i> — Если бы у меня было много денег, я бы купил дом. С be часто пишут <b>were</b> для всех: <i>If I were you…</i></p>
  <p><b>3:</b> <i>If I had studied, I would have passed the exam.</i> — Если бы я учился, я бы сдал экзамен (но не учился и не сдал).</p>
  <p>Части можно поменять местами; запятая нужна, когда if стоит в начале.</p>`,
  ex:[['If you mix red and white, you get pink.','Если смешать красный и белый, получится розовый.',"Qizil va oqni aralashtirsangiz, pushti rang chiqadi."],["If I see Akmal, I'll tell him.",'Если увижу Акмала, скажу ему.',"Akmalni ko'rsam, unga aytaman."],['If I were you, I would take this job.','На твоём месте я бы согласился на эту работу.',"Sening o'rningda bo'lganimda, bu ishni olardim."],['If we had left earlier, we would have caught the train.','Если бы мы вышли раньше, мы бы успели на поезд.',"Ertaroq chiqqanimizda, poyezdga ulgurgan bo'lardik."]],
  err:[['If it will rain, we will stay.','If it rains, we will stay.','После if — Present Simple.'],['If I would have money, I would buy it.','If I had money, I would buy it.','В части с if would не ставят.'],['If I had known, I would told you.','If I had known, I would have told you.','Тип 3: would have + V3.'],['If I am you…','If I were you…','Совет «на твоём месте» — тип 2.']],
  quiz:[['If you ___ water to 100°C, it boils.',['heat','will heat','heated'],0,'Тип 0 — факт.'],['If she ___ hard, she will pass.',['studies','will study','studied'],0,'Тип 1 — после if Present Simple.'],['If I ___ rich, I would travel the world.',['am','were','will be'],1,'Тип 2 — мечта.'],['If he had called, I ___ him.',['would help','would have helped','will help'],1,'Тип 3.'],['I ___ buy that car if I had the money.',['will','would','had'],1,'Тип 2 — would.']]},
 {id:'reported',part:4,n:'Косвенная речь',s:'Как передать чужие слова',
  tip:'Пересказываем — сдвигаем время на шаг назад и меняем «я» на «он / она», «здесь» на «там».',
  html:`<p>Прямая речь: <i>Akmal said, "I <b>am</b> tired."</i> Косвенная: <i>Akmal said (that) he <b>was</b> tired.</i></p>
  <p>Когда вводный глагол в прошлом (said, told), время сдвигается так же, как в главе «Согласование времён»: am → was, will → would, have done → had done, did → had done.</p>
  <h3>Что ещё меняется</h3>
  <table><tr><th>Прямая речь</th><th>Косвенная</th></tr>
  <tr><td>I, my</td><td>he / she, his / her</td></tr><tr><td>now</td><td>then</td></tr><tr><td>today</td><td>that day</td></tr>
  <tr><td>yesterday</td><td>the day before</td></tr><tr><td>tomorrow</td><td>the next day</td></tr><tr><td>here, this</td><td>there, that</td></tr></table>
  <h3>Say или tell?</h3><p><b>say</b> — без «кому»: <i>He said that…</i> <b>tell</b> — обязательно кому: <i>He told <b>me</b> that…</i></p>
  <h3>Вопросы и просьбы</h3>
  <p>Вопрос становится утверждением, без do / did: <i>"Where do you live?" → She asked where I <b>lived</b>.</i> Да / нет вопросы — через <b>if</b>: <i>He asked <b>if</b> I was busy.</i></p>
  <p>Просьбы и приказы — через to: <i>"Close the door." → She asked me <b>to close</b> the door. "Don't shout." → He told us <b>not to shout</b>.</i></p>`,
  ex:[['She said that she was hungry.','Она сказала, что голодна.',"U och ekanini aytdi."],['He told me he would come later.','Он сказал мне, что придёт позже.',"U menga keyinroq kelishini aytdi."],['They asked where we lived.','Они спросили, где мы живём.',"Ular qayerda yashashimizni so'rashdi."],['Mom asked me to buy some bread.','Мама попросила меня купить хлеба.',"Oyim mendan non olib kelishimni so'radi."],['The teacher asked if we had finished.','Учитель спросил, закончили ли мы.',"O'qituvchi tugatgan-tugatmaganimizni so'radi."]],
  err:[['He said me that…','He told me that…','С «кому» — told.'],['She asked where did I live.','She asked where I lived.','В косвенном вопросе нет did и обратного порядка.'],['He told to me to wait.','He told me to wait.','Tell + кому без to.'],['She said she will come.','She said she would come.','Will → would.']],
  quiz:[['"I am busy." → She said she ___ busy.',['is','was','has been'],1,'Am → was.'],['He ___ me that he was leaving.',['said','told','asked'],1,'С «кому» — told.'],['"Do you like tea?" → She asked ___ I liked tea.',['that','if','do'],1,'Да / нет вопрос — if.'],['"Sit down." → The teacher told us ___ down.',['sit','to sit','sitting'],1,'Приказ — to + V.'],['"I will call you." → He said he ___ call me.',['will','would','can'],1,'Will → would.']]},
 {id:'wish',part:4,n:'Wish',s:'Жаль, что… / Хотел бы я…',
  tip:'Wish всегда «отодвигает» время назад: о настоящем — Past Simple, о прошлом — Past Perfect.',
  html:`<p>Wish выражает сожаление или мечту. Русское «Жаль, что я не…» и «Хотел бы я…» по-английски строится через wish со сдвигом времени.</p>
  <table><tr><th>О чём жалеем</th><th>Формула</th><th>Пример</th></tr>
  <tr><td>о настоящем</td><td>wish + Past Simple</td><td>I wish I <b>knew</b> the answer. — Жаль, что я не знаю ответа.</td></tr>
  <tr><td>о прошлом</td><td>wish + Past Perfect</td><td>I wish I <b>had studied</b> more. — Жаль, что я мало учился.</td></tr>
  <tr><td>о чужом поведении, раздражение</td><td>wish + would</td><td>I wish you <b>would stop</b> talking. — Хоть бы ты замолчал.</td></tr>
  <tr><td>умение</td><td>wish + could</td><td>I wish I <b>could</b> swim. — Жаль, что я не умею плавать.</td></tr></table>
  <p>С be можно <b>were</b> для всех лиц: <i>I wish I <b>were</b> taller.</i></p>
  <p>Обрати внимание: смысл противоположный — по-русски «не знаю», по-английски утверждение <i>I wish I knew</i>.</p>
  <p><b>If only</b> — то же самое, только эмоциональнее: <i>If only I had more time!</i></p>`,
  ex:[['I wish I had more free time.','Жаль, что у меня мало свободного времени.',"Qani endi bo'sh vaqtim ko'proq bo'lsa."],["I wish I hadn't eaten so much.",'Жаль, что я так много съел.',"Bunchalik ko'p yemaganimda edi."],['I wish I could speak Chinese.','Хотел бы я говорить по-китайски.',"Qani endi xitoycha gapira olsam."],['I wish it would stop raining.','Хоть бы дождь прекратился.',"Qani endi yomg'ir to'xtasa."]],
  err:[['I wish I have a car.','I wish I had a car.','О настоящем — Past Simple.'],['I wish I didn\'t say that.','I wish I hadn\'t said that.','О прошлом — Past Perfect.'],['I wish I can swim.','I wish I could swim.','Can → could.'],['I wish I would be taller.','I wish I were taller.','О себе would не используют.']],
  quiz:[["I don't know her number. I wish I ___ it.",['know','knew','had known'],1,'О настоящем — Past Simple.'],['I missed the bus. I wish I ___ earlier.',['left','had left','would leave'],1,'О прошлом — Past Perfect.'],["I can't drive. I wish I ___ drive.",['can','could','would'],1,'Умение — could.'],['I wish I ___ taller.',['am','were','will be'],1,'Be → were.'],['I wish you ___ stop making noise!',['will','would','had'],1,'Раздражение — would.']]}
];
