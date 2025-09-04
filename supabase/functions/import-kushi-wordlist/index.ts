import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KushiEntry {
  goji_word: string;
  part_of_speech: string;
  english_translation: string;
  hausa_translation?: string;
  example_sentence?: string;
  cultural_context?: string;
  literal_translation?: string;
  semantic_category: string;
  difficulty_level: string;
  pronunciation_guide?: string;
  tone_marking?: string;
}

// Comprehensive Kushi-English-Hausa wordlist from University of Naples 'L'Orientale'
const KUSHI_WORDLIST_DATA = `
ʔáɓùrùl	n. okra. kuɓewa.
ʔàdéelè	n. hail. ƙanƙara.
ʔàdúnúnò	n. horn. ƙaho.
ʔàɗò	n. 1. eye. ido. 2. face. fuska.
ʔáɗáy	n. gazelle. barewa.
ʔàɗɗɔ̀	v. eat (meat). ci (nama)
ʔàɗéewè	n. bird. tsuntsu.
ʔáɗéŋré	n. scorpion. kunama.
ʔáeshàw	n. grain. hatsi, tsaba.
ʔàgwàgwá	n. duck. agwagwa.
ʔàkúlà	n. mantis. ƙoƙi-ƙoƙi.
ʔàkùmóm	n. hedgehog. bushiya.
ʔàládè	n. pig. alade.
ʔàlàw	n. leaf. ganye.
ʔàllágà	n. house rat. ɓera, kusu.
ʔàlúurà	n. needle. allura.
ʔàmmò	v. 1. climb up. hawa. 2. ride horse. hau doki.
ʔámít	n. upper stone. dutse na sama.
ʔàŋò	v. pay for debt. biya bashi.
ʔàn	n. possessor, owner of. mai.
ʔàn ɗíyè	n. potter. mai (ginin) tukwane.
ʔàn gàŋgàŋ	n. drummer. makaɗi.
ʔàŋ gèerù téré	n. evening star. zara.
ʔàn gèy	n. enemy. abokin gaba.
ʔàn gùnùl	n. priest. fada.
ʔàn kə̀nímmà	n. rainmaker.
ʔàn kpáanì	n. tanner. majemi.
ʔàn kùwà	n. blacksmith. maƙeri.
ʔàn láddò	n. weaver. masaƙi.
ʔan límmò láɣát	n. leatherworker. baduku.
ʔàn páawà	n. butcher. mahauci.
ʔàn shìráw	n. peasant. manomi.
ʔàn shɔ̀ɔ	n. sorcerer. maye.
ʔàn shɔ̀r	n. dancer. mai rawa.
ʔàn tà shwè	n. hunter. mafarauci.
ʔàn tòom	n. warrior. gwarzo, jarumi.
ʔàn tùɣ nìnyò	n. murderer. mai kisan kai.
ʔàn vònàk	n. singer. mawafi.
ʔàn wɔ̀lɔ̀	n. witch. mayya.
ʔàn wùrìn	n. healer, medicine man. boka.
ʔàŋè	n. cat, wild cat. muzuru, muzurun daji.
ʔàngárùm	n. sword. takobi.
ʔàníyùm	adj. unripe. ɗanye.
ʔànjà	n. salt. gishiri.
ʔànshìndáw	n. pepper. barkono.
ʔàntúgó	n. gecko, house lizard. tsaka.
ʔàntórò	n. francolin. makwarwa.
ʔàr shíilì	n. testicles. golo.
ʔàràt	n. thorn. kurna.
ʔárí	n. pea. waken Turawa.
ʔárkyaw	n. sesame. ridi.
ʔàrshàl	n. star. zara.
ʔàrùm	n. onion. albasa.
ʔáyúkh	n. small ant of the bush. ƙaramin cinnaka ta jeji.
ʔàyùkh	n. rat. kusa, ɓera.
ʔélé	n. voice. murya.
ʔèm	n. ring. zobe.
bèe	v. shoot. harba.
bànà	n. antelope. mazo, ragon ruwa, gwanki.
bàrà	n. trap. tarko.
bèndè	n. penis sheath. gidan azzakari.
bì	n. back. baya.
bì bìró	n. bark of tree. ɓawo.
bì gbɔ́ŋ	n. nape (of neck). ƙeya.
bì shò	n. footprint. sawun ƙafa.
bìirìm	n. heel. diddige.
bìlìr	n. flower. fure.
bìndìgà	n. gun. bindiga.
bìnnò	n. guest, stranger. baƙo.
bìró	n. tree with no leaves. itace.
bùkwátì	n. bucket. bokiti.
ɓàakh	n. wing. fiffike.
ɓàkà	n. natron.
ɓálá	n. tiredness. gajiya.
ɓáŋ	n. strength. ƙarfi.
ɓán fɔ̀k	n. courage. jaruntaka.
ɓánnì	n. baobab tree. kuka.
ɓày	n. dog. kare.
ɓə̀ək	n. wing(s). fiffike.
ɓèrà	n. facial markings. sasshawa.
ɓìrò	v. beat. buga.
ɓìr(ì) shàw	n. flail.
ɓòŋ bìró	n. trunk. gangar jiki.
ɓɔ̀ɔlì	n. east. gabas.
ɓɔ̀rɔ̀n	n. type of millet. irin gero.
ɓùk	n. soil. ƙasa.
ɓwàarò ɗìyò	n. divorce. saki.
ɓwáré	n. rattle. caki.
ɓwèyù	n. underworld.
ɓwòy	n. today. yau.
dàbáŋ	n. festival. biki.
dàmàl	n. bushy tail. gafiya.
dáŋ	n. door. ɗaki.
dàŋ1	n. south. kuda.
dàŋ2	prep. above. (a) kan, bisa da.
dànàm	n. sister-in-law. ƙanwa.
dàngà	n. fence. shinge.
dànyùkh	n. frog, toad. kwaɗo.
dàràŋ	n. sun. rana.
dàràŋ dén	n. sunshine. hasken rana.
də̀ɓɓà	n. hyena. kura.
dèet	n. fire. wuta.
dèwè	n. stick used to decorate pots.
dèy	n. sinew. agara.
dìgré	n. big storage pot. kwatarniya.
dìl bìró	n. forest. daji, jeji.
dìmlìm	n. 1. charcoal. gawayi. 2. soot. kunkunniya.
dìŋ1	n. laterite. marmara.
dìŋ2	adj. black. baƙi.
dìnyì	n. sheep. tunkiya.
dìráŋ	n. locust-bean tree. ɗorawa.
dìishò	v. stamp, pound. daka.
dòɣbɔ́	n. ruin. kango.
dòlòní	n. ant. kiyashi, cinnaka, tuma-da-gayya.
dòo	n. water. ruwa.
dòo wùrì	n. milk. nono.
dòodó	n. spirit. kurwa, aljani, iska.
dɔ̀ŋ	n. field, farm. gona.
dùbù	num. thousand. dubu.
dùŋò	n. smoke. hayaƙi.
dúmmò	n. hoe. fartanya, hauya.
dùurò	n. bambara nut. gujiya.
dùwò	n. ghost. fatalwa.
dùwàaɣnò	n. groundnut. gyaɗa.
dùyó	n. fly. ƙuda.
ɗák	n. tongue. harshe.
ɗáwán	v. bundle. dami.
ɗìgù	v. build. gina.
ɗìikó	n. mortar. turmi.
ɗímím	n. time. lokaci.
ɗímmín	inter. when? yaushe?
ɗìŋò	v. cook. dafa.
ɗìyò	n. marriage. aure.
ɗíyè	n. small pot for water. kula.
ɗɔ̀ɣbɔ́	n. clay. laya, lumbu.
ɗɔ́ɣlá	n. cultivated ground. noma.
ɗɔ̀k	num. one. ɗaya.
ɗòorò	n. pipe. lofe.
ɗúndì	n. bottle gourd. buta.
ɗùmmò	v. boil. tafasa.
ɗùulò	v. cool. huce.
ɗúulàn	adj. wet. jiƙaƙƙe.
ɗwèy	n. tomorrow. gobe.
fàràgbànàŋ	num. six. shidda.
fàrlów	num. seven. bakwai.
féè	n. chicken. kaza.
fíìk	n. arrow. kibiya.
fìléríyà	n. malaria. zazzaɓin cizon sauro.
fìnnè	n. thigh. cinya.
fɔ̀ dáŋ	n. doorway. ƙofa.
fɔ̀ dòo	n. spring of water. idon ruwa.
fɔ̀ gùn	n. anus. dubura.
fɔ̀ kírá	n. finger. yatsa.
fɔ̀ lùwàk	n. liver. hanta.
fɔ̀ shə̀ərì	n. heart. zuciya.
fɔ̀ shúrùk	n. riverbank. bakin kogi.
fɔ̀ tèerè	adv. there. can.
fɔ̀də́mlì	n. sickle (for cutting grass only). lauje.
fɔ́ɗɗɔ̀	v. weed, pluck out. yi noma.
fɔ̀k	n. 1. mouth, lip. baki, leɓe. 2. language. harshe, yare.
fɔ̀nnò	n. father's brother. kawu, baffa.
fɔ̀ɔrà kúnò	n. escape. tsira, gudu.
fɔ̀ɔrɔ̀	n. forehead. gaba.
fòoró	n. punishment. horo.
fɔ̀shénnì	adv. there. can.
fɔ̀tè	adv. here. nan.
fɔ̀yɔ́	n. black ant. cinnaka.
fòɗùlò	v. worship. yi bauta, bauta wa.
fɔ̀ɣèràw	num. nine. tara.
fùɗɗɔ̀	v. wash clothes. wanke tufafi.
fùgrò	n. bellows. zugazugi.
fùgùm	n. blind. makaho.
fúulá	n. rope. igiya.
fùllùm	n. silk cotton tree (white flowers). rimi.
fùumò	n. tse-tse fly. ƙudan tsando.
fúvùl	n. foam. kumfa.
fúwàt	num. five. biyar.
gàaɣá	n. grandmother. kaka.
gàakh	n. crow. hankaka.
gàalé	n. water storage pot. randa.
gààrè	n. robe (man's gown). riga.
gàarì	n. flea. ƙuma, tunkuyau.
gàɣàl	adj. red. ja.
gájágí	n. xylophon. balanho.
gàlmà	n. ram. rago.
gáŋà	n. basket. kwando.
gàndù	n. tax. haraji.
gàŋgàŋ	n. drum. ganga.
gàŋrùŋ	n. world or place of dead.
gàpà	n. rice. shinkafa.
gàráyà	n. string instruments. tsirkiya.
gàrìnjìn	n. white rat. farin ɓera.
gàsshò	v. find. samu.
gbàaɣò	v. hollow out, carve wood. sassaƙa.
gbàamé	n. axe. gatari.
gbàk	n. vagina. farji.
gbáláŋ	n. ornament. abin ado, kayan ado.
gbáŋ	n. goodness, wellness. lafiya.
gbáŋlàŋ	n. pestle. taɓarya.
gbáŋùm	n. unwell, sick. maras lafiya.
gbàrìm	n. daughter or son in-law. sarakuwa.
gbárlàm	n. anklet. munduwa.
gbàrùm	n. mother or father-in-law. suruki, suruka.
gbáyákh	n. crop (bird). maƙoƙo.
gbé	adj. big, senior. babba.
gbìilì	n. chest. ƙirji.
gbɔ́ŋ	n. neck. wuya.
gbɔ̀nnà	prep. across. (a) ƙetaren.
gbɔ́shì	n. headpad. gammo.
gbàarò	v. strip off. tuɓe.
gɓàalò	v. throw a spear. jefa mashi.
gèe	prt. used to form numerals.
gènó	n. mother's brother. wa.
gə̀rùm	n. molar. matauni.
gètè	n. hawk, eagle. shaho.
gèy	n. war. yaƙi.
gìrbì	n. donkey. jaki.
gìrìr	n. tail. wutsiya.
gódó	n. blanket. bargo.
gòkh	n. cock. zakara.
góndà	n. pawpaw. gwanda.
gɔ̀ɣlɔ̀	n. shell. ƙwanso.
gɔ̀lɔ̀m	n. grasshopper. fara.
gɔ̀ŋlàŋ	n. date. dabino.
gɔ̀ŋɔ̀	n. belly. ciki.
gòoròk	n. throat. maƙogwaro.
gúlá	n. drum stick. makaɗi.
gùlmà	n. accusation. tuhuma.
gùm	prep. under. ƙarƙashin.
gùmè	n. hut, room. ɗaki.
gùn	n. anus. dubura.
gùŋgúl	n. elbow. gwiwar hannu.
gùngù	n. lame. gurgu.
gùnùl	n. ritual place. wuri na al'ada.
gùp	n. chief, king, emir. sarki.
gùráŋ	n. calabash. duma, ƙwarya.
gùrùŋ	n. horse, mare, stallion. doki.
gwàaja	n. cocoyam, taro. doya.
gwàŋ	n. food. abinci.
ʔíshàn	adj. dry, dried.
ʔìshì fɔ̀k	n. thirst. ƙishirwa.
ʔìshì shwè	n. cornstalk. kara.
ʔìshò	v. dry up. janye.
ʔìshɔ̀	v. grind. ɓarza, niƙa.
jáɣlùm	n. cheek. kunci.
jàmmó	n. loom. masaƙa.
jáŋ	n. jaw. mummuƙe.
jàŋàní	n. leopard. damisa.
jàrà	n. big basket for corn. kwando.
jàwéddà	n. small knife used for harvesting.
jáwít	n. cutlery. wuƙa, cokali.
jèdè	n. shield. garkuwa.
jə̀ə	n. bean(s). wake.
jèlà	n. side. (a) hannu.
jéné	n. caterpillar. gizaka.
jènè	n. dryness, aridity. rani.
jènyè	n. crab. ƙaguwa.
jèrà gɔ̀ŋɔ̀	n. ribs. haƙarƙari.
jèrè	n. friend, age-mate. aboki.
jèshílè	n. trumpet. kakaki.
jêy	n. porcupine. beguwa.
jìi	n. place of burning.
jìijí	n. 1. grandfather. kaka. 2. ancestor. mutanen dauri.
jìkò	n. rich. mai arziki.
jìrà	n. bed. gado.
jírí	n. thief. ɓarawo.
jìrìm	n. spirit of a place. iska.
jìró	n. red monkey.
jìwò	v. snare. zarge.
jìwúr	n. worm. tsutsa.
jìyaw	adv. left. hagu.
jɔ̀d	n. filter. mataci.
jɔ̀k	n. black wasp. zanzaro.
jɔ́rrɔ́	n. locust. fara.
jùjákh	n. straw. haki.
jùk1	n. elephant. giwa.
jùk2	n. chair. kujera.
jùŋrɔ̀ŋ	n. basket for corn.
júr	n. squirrel. kurege.
jùwò	v. jump. yi tsalle.
jwál	n. hole.
jwál fírǎ	n. scar, notch. tabo.
jwàlé	n. cricket. gyare.
kàawò	v. sow. shuka.
kà dàràŋ	n. daylight, noon. rana, tsakar rana.
káasùwà	n. market. kasuwa.
kàmmà	n. lion. zaki.
káŋ	n. granary. rumbu.
kàr kúwò	n. circumcision. kaciya.
káráráwá	n. bell. ƙarrarawa.
kàsh	n. spear. mashi.
káshò	n. harvest. kaka.
kàshò	v. harvest. gira, rora, cira.
kàyò	v. hoe. yi noma.
kàyò táy	v. cut into pieces. yayyanka.
kə́nə́	n. money. kuɗi.
kə̀rə̀k	n. border. iyaka.
kə̀nímmà	n. fetish. juju.
kèlà	n. monitor lizard. damo.
kènè ɗìyò	n. cowrie. wuri.
kènnì	n. poor. matalauci.
kérákh	n. mahogany tree. maɗaci.
kèrè	n. roof of granary. jinkar rumbu.
kèrèm	n. crocodile. kada.
kèrò	v. measure. auna, gwada.
khà	v. wound. yi wa rauni.
kháa	n. gruel. kunu.
khàyukh	n. termite. gara, gina, zago.
khèeyàw	n. white sesame. riɗi.
khèwnè	n. bush cow. saniya.
khɔ́ɣɔ́	n. track. hanya.
khù	n. head. kai.
khùrùwò	n. cowry. wuri.
kínə́	n. money. kuɗi.
kírá	n. arm, hand. hannu.
kírá bìró	n. branch. reshe.
kíríyípɔ́	n. dawn, evening. assalatu.
kɔ̀ɗɔ̀	n. claw. ƙambori.
kɔ́ɣɔ́	n. road. hanya.
kɔ́ɣɔ́ dàm	n. vein. jijiya.
kɔ̀lɔ̀	n. widow. bazawara.
kɔ̀n	n. judge. alƙali.
kɔ̀ɔmɔ̀	n. maize. masara.
kɔ̀shɔ̀	v. filter. tace.
kpàa	n. horn. ƙaho.
kpèyù	n. snake living in water. macijin ruwa.
kpíshì	n. dust cloud. hadarin ƙura.
kpòmù	num. ten. goma.
kpàanò	v. tan. jeme.
kpòolɔ́	n. yesterday. jiya.
kù	prep. on. a kan.
kù dàŋ	n. 1. sky. sama. 2. heaven. Aljanna.
kù mínná	n. roof. jinka.
kùɓùk	n. land, ground. ƙasa.
kúmá	n. corpse. gawa.
kúmmí	n. navel. cibiya.
kúnná	n. dysentery. atuni.
kúmó	n. ear. kunne.
kùmùm	n. doubt. shakka.
kù péewè	n. world. duniya.
kúrét	n. snake. maciji.
kùurò	n. bitter tomato. gauta.
kùurò dɔ̀ɔ	n. type of bitter tomato (not dried). ɗata.
kùwò	v. lend. ranta, ara wa.
kùwò	n. penis. azzakari.
kùwà	v. forge. maƙera.
kùwák	n. curse. laʔana.
kúwó	n. debt. bashi.
kúyám	n. hunger. yunwa.
là	n. child, son. ɗa.
là gèɣè	n. bride (girl not married).
là ɗúndì	n. small bottle gourd. buta.
là gàráyà	n. musical bow. izga.
là mínná	n. servant. bara, barabya.
là shìrìp	n. daughter. 'ya mace, ɗiya.
là shúrùk	n. seasonal river. kogi.
là shùɣì	n. boy, son. ɗa.
là tálàŋ	n. pot for cooking soup. tukunya.
là témmè	n. calabash for drinking beer. duma.
láalá	n. spider. gizo-gizo.
láayá	n. charm. laya.
láɗú	n. grey sesame. riɗi.
làɗì	n. north. arewa.
láɣát	n. leather, skin (animal). fata (dabba).
láɣát (shìk)	n. body skin. fatar jiki.
láját	n. outfit of hunter. rigar mafarauci.
làkà	n. orphan. maraya.
làllò	v. ruminate. ci (saniya).
làmbú	n. garden. gadina, lamu.
lànnà	n. clothes. tufafi.
lèeláw	n. cotton. auduga.
léɣá	n. desire. shaʔawa.
lèwɔ̀	v. want, like, love. so.
lí	v. put. sa.
lìlámdè	n. butterfly. malam-buɗa-mana-littafi.
lɔ̀ɔ	n. meat. nama.
lúrú	n. bag. jaka.
lùgnì	n. shade. inuwa.
lùmmò	n. flour. gari.
lùmmò ɓùk	n. fine sand. rairayi.
màlàc	n. rainbow. bakan gizo.
màlàc dòo	n. rainbow. bakan gizo.
màlɣò	n. lightning. walƙiya.
màmmà	n. ant-hill. jiɓa, suri, shuri.
màŋlàŋ	n. skull. ƙwaƙwalwa, kwanya.
mánná	n. husband. miji.
mə̀n	n. beer. giya.
mə̀n ɗíyè	n. beer pot. tulun giya.
mè ʔàn	adv. many. da yawa.
méemé	n. wasp. zanzaro.
Mèerò	v. make, braid rope.
mèrà	n. travel. tafiya.
mìɗò	n. stirring stick. muciya.
mìigù	n. owl. mugiya.
mìllán kpòolɔ́	adv. last year. bara.
mìmé	n. people. mutane.
mínná	n. house. gida.
mínná gùp	n. palace. gidan sarki.
mínná kə̀nímmà	n. oracle.
mòɗɗò	n. millet. gero.
mòllò	n. brother. ƙane.
mòllà	n. sister.
mòlón	n. relative. dangi.
mɔ̀n tùɣànò	n. and adj. drunk. bugagge.
mɔ̀r	n. oil. mai.
mɔ̀r tàngà	n. butter. man shanu.
móotò	n. car. mota.
múlkì	n. chieftancy. sarauta.
mùrɔ̀	v. die. mutu.
mùshì	n. jealousy. kishi.
nàa	n. elephant. giwa.
náanì	n. thunder. hadari.
nèsshò	v. rest. huta.
nèy	n. fight. faɗa.
nìmmì	adv. near. kusa.
nìŋò	n. person, man. mutum.
nìŋòn dìn	n. black man.
nìŋòn gàràl	n. white man. bature.
nìyò	v. mature, become ripe. nuna.
nɔ̀nnɔ́	n. mother. uwa.
ŋɔ̀rì	n. rainbird.
nùrò	v. heal. warke, warkar da.
ʔɔ́ɣrɔ́	n. bottle. kwlaba.
ʔɔ̀ppɔ̀	v. dig. haƙa.
ʔɔ̀ppɔ̀ dùwò	n. funeral. janaʔiza.
ʔòshò	v. swell. kumbura.
pámmò	n. ordeal.
pàrɔ̀	v. herd (animals).
pàttò	v. give birth. haifa.
pə̀ək	n. lungs. huhu.
pə̀əmún	n. female, wife. mace.
pə̀llɔ̀w	num. two. biyu.
pè	adj. white. fari.
péèn	n. seed.
péeròw	num. four. huɗu.
péewé	adv. outside. waje.
pèrèt	n. mosquito. sauro.
pèrɔ̀	v. go out. fita.
pìdìɗòw	num. eight. takwas.
pìl	n. hook. ƙugiya.
pírá	n. sore, wound, disease. rauni.
pìrìt	n. wind. iska.
pìrìt dòo	n. storm. ruwa da iska.
pìrù	v. come out. fito.
ràagúmì	n. camel. raƙumi.
rèeké	n. sugar cane. kara.
rêw	n. python. mesa.
rə́wák	n. baboon. gwaggon biri.
rè	v. enter. shiga.
réy	n. life. rai.
ríibà	n. profit. riba.
ríijà	n. well. rijiya.
ríwít	n. fire-place. wurin wuta.
ròmìsh	n. twin. ɗan tagwai.
sháafì	n. religious object. abin addini.
shèewò	v. plant, transplant. shuka.
shábá	n. lie. karya.
shàɣlò	n. sleep. barci.
shàmmàm	n. viper.
shàŋà	n. bridegroom. ango.
shànɣò	v. exchange goods. kaya.
shányè	n. yam(s). doya.
sháppàn	n. diarrhoea. zawo.
shàrgey	n. weapon. makami.
shárí	n. load. kaya.
shàw	n. Guinea corn. dawa.
sháwán	n. spirit. iska.
shə̀əd	n. morning. safiya.
shégní	n. bee.
shègré	n. the past. da.
shégrí	n. hiccough. shaƙuwa.
shékì	prep. between. tsakanin.
shèllè	n. vulture. ungulu.
shèmù	n. poison. guba.
shén	n. cleverness. azanci, fasaha.
shènè	n. year. shekara.
shéwó	n. 1. fear. tsoro. 2. shame. kunya.
shí mínná	n. wall (house). bango.
shìɓɔ̀ gə̀də̀	n. terrace. gandu.
shìɗə̀r	n. fat. kitse.
shíɣá	n. loss. rashi.
shìilà	n. stone, rock, hill. dutse.
shìilà ɓàalà	n. escarpment. dutse.
shíiwé	n. firewood. itace.
shìk	num. hundred. ɗari.
shìk	n. body. jiki.
shìlím	n. mongoose. tunku.
shìm1	n. drum (hour glass). kalangu.
shìm2	n. cough. tari.
shìrìm	n. fish. kifi.
shìrìp	n. woman. mace.
shíwó	n. small ant. kiyashi.
shìwòn	n. shrew. jaɓa.
shìwrì	n. long-tail rat. ɓera, kusu.
shíyá	n. menstruation. haila.
shò	n. leg, foot. ƙafa.
shɔ̀	v. drink. sha.
shɔ́k	n. hair. gashi.
shɔ́k fɔ̀k	n. beard. gemu.
shɔ́k shìk	n. body hair. gashin jiki.
shɔ̀kh	n. hair, fur, feather. gashi.
shɔ̀mmɔ̀	n. name. suna.
shɔ̀r	n. dance. rawa.
shóorím (bìró)	n. root. saiwa.
shù	v. eat (tuwo). ci (tuwo).
shúná	n. dream. mafarki.
shúŋúr	n. shinbone. sangali.
shúrɔ́	n. laugh. dariya.
shúrùk	n. river. kogi.
shùjì	n. male. miji.
shùkkàn kírá	n. fist. dunƙulen hannu.
shùnò	v. skin. feɗe.
shùngù	n. cloud. gajimare, girgije.
shúurò shàw	n. threshing.
shùrmì	n. hare. zomo.
shùurò	v. fry. soya, toya.
shùuɣò	v. cheat. cuta.
shùwè	n. wood. itace.
shwè	n. bush. daji, jeji.
shwìyàk	n. sand. yashi.
shwíyə̀k	n. dew. raɓa.
tà	prep. in, at, inside. a, ciki(n).
tà ʔáà	n. stomach. ciki.
tà ɓə̀ək	n. armpit. hamata.
tàɓùk	n. land. ƙasa.
tà gə̀də̀	n. slope. gangara.
tà gùmè	n. entrance hut. zaure.
tà kɔ̀n	n. legal case. ƙara.
tà mínná(mù)	n. lineage.
tà mínná(nò)	n. family.
tà múu	n. unfarmed ground.
tà shúrùk	n. valley. kwari.
tàa	n. shoe. takalma.
tàará	n. father. uba.
tàat	num. three. uku.
tàawa	n. tobacco. taba.
tálí	adv. far. nesa.
tàŋgà	n. bull.
tàvrò	n. west. yamma.
téelè	n. worm. tsutsa.
télàŋ	n. cooking pot. tukunya.
tèmèl	n. shoulder. kafaɗa.
témmè1	n. small calabash. ƙaramin duma.
témmè2	adv. right. dama.
tèmmò	v. sweep, clean. share.
téré	n. moon. wata.
tèrèt	n. broom. tsintsiya.
tìtɔ́ŋ	inter. where? ina?
tòbbò	v. sow (seeds in holes). shuka, yi binne.
tɔ̀ɗókù	n. fever. zazzaɓi.
tɔ̀k	n. mat. tabarma.
tɔ̀lɔ́tɔ̀lɔ́	n. turkey. talotalo.
tònnò	v. 1. spin (thread). kaɗa. 2. weave. saƙa.
tɔ̀ɔ ʔárát	n. Talha gum Arabic tree. ƙaro.
tɔ̀ɔm	prep. in front (of). a gaba(n).
tùɓɓò	n. rubbish heap. juji.
túɣá shìgnì	n. unnatural death.
tùɣò	v. kill. kashe.
tùkkò	v. 1. tie a rope. ɗaura. 2. knot. ƙulla.
túmmò	n. guinea-fowl. zabo.
twàanà	n. silk cotton tree (red flowers). rimi.
twɔ̀ŋé	n. small, black ant. cinnaka.
ʔùn	n. pregnancy. ciki.
vànà	n. black sesame. baƙin riɗi.
vàré	n. he-goat. bunsuru.
vèe	n. chin. haɓa.
vìɣè	n. cobra. gamsheƙa.
vìnò	v. throw a stone. jefa dutse.
vìn	n. grinding stone. dutsen niƙa.
vìyò	n. demon, spirit. iska, aljani.
vìyò	n. rainy season. damina.
vìyè	n. sauce, soup. miya.
vònàk	n. song. waƙa.
vɔ̀ɔn	n. pumpkin. kabewa.
vùlùk	n. cave. kogon dutse.
vúró	n. gun powder. albarushi.
vùrɔ̀	n. ashes. toka.
vùrùm	n. knee. gwiwa.
wànɣì	n. trousers. wando.
wàré	n. mouse. ɓera.
wàrù	v. come. zo.
wàw	n. sacrifice. hadaya.
wè bì gùrùŋ	n. saddle. sirdi.
wè fɔ́ gùrùŋ	n. bit (horse). linzami.
wè kírá	n. bracelet. abin hannu.
wè kúmó	n. earring. 'yan kunne.
wè túr	n. necklace. abin wuya.
wə̀rì	n. breast. nono.
wìirì	n. Indian tamarind. tsamiya.
wìshɔ̀	v. roast. gasa.
wìyàk	n. bone. ƙashi.
wɔ̀jɔ̀	v. avoid, abstain. ƙarauce wa.
wɔ̀kù	n. helmet. hular kwano.
wɔ̀kù	n. cap. hula.
wúró	n. tooth. haƙori.
wùjìn	n. nose. hanci.
wùlù	v. strike fire. kunna wuta.
wùllò	v. bubble, ferment. ruɓa.
wùrì	n. breast. nono.
wùrìn	n. medicine. magani.
wùrɔ̀k	n. pus. mugunya.
yù mə̀n	v. brew (beer). dafa.
yù mèrà	v. travel. yi tafiya.
yàamúɣì	n. brother-in-law. ƙane, wa.
yàllò	n. shouting. ihu.
yàmmà	n. god. Allah, Ubangiji.
yàrà shwè	n. hunt. farauta.
yèrà	n. itch. ƙaiƙayi.
yèrì	n. red ant. jan kiyashi.
yèrò	v. bite. ciza.
yìbà dèet	n. flame. harshen wuta.
yìirà	n. reception. liyafa.
yípó	n. evening, night, darkness. dare, duhu.
yìipò shìrìim	v. to fish. sunta, yi fatsa.
yò	v. call. kira.
yù	v. do, make. yi.
yù ɓèrà	v. cut marks. shasshauta.
yù ɗìyò	v. marry. yi aure.
yù gùp	v. rule. yi mulki.
yù jírí	v. steal. sata.
yù nèy	v. fight. yi faɗa.
yù shìlìp	v. suffer. sha wahala.
yùɣlà	n. medium size calabash. ƙwarya.
`;

function parseKushiEntry(line: string): KushiEntry | null {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('//')) return null;

  try {
    // Split by tab or multiple spaces
    const parts = cleanLine.split(/\t+|\s{2,}/);
    if (parts.length < 2) return null;

    const kushiWord = parts[0].trim();
    const rest = parts.slice(1).join(' ').trim();

    // Extract part of speech (first occurrence after word)
    const posMatch = rest.match(/^(n\.|v\.|adj\.|adv\.|prep\.|inter\.|num\.)/);
    if (!posMatch) return null;

    const partOfSpeech = posMatch[1].replace('.', '');
    const afterPos = rest.substring(posMatch[0].length).trim();

    // Split by periods to separate translations
    const segments = afterPos.split('.');
    const englishPart = segments[0]?.trim();
    const hausaPart = segments[1]?.trim();

    if (!englishPart) return null;

    // Determine semantic category based on content
    let semanticCategory = 'general';
    const lowerEng = englishPart.toLowerCase();
    
    if (lowerEng.includes('animal') || kushiWord.includes('ɓày') || englishPart.includes('dog') || englishPart.includes('cat') || englishPart.includes('bird') || englishPart.includes('ant')) {
      semanticCategory = 'animals';
    } else if (lowerEng.includes('body') || englishPart.includes('eye') || englishPart.includes('hand') || englishPart.includes('head') || englishPart.includes('face')) {
      semanticCategory = 'body_parts';
    } else if (partOfSpeech === 'num') {
      semanticCategory = 'numbers';
    } else if (englishPart.includes('house') || englishPart.includes('door') || englishPart.includes('room')) {
      semanticCategory = 'household';
    } else if (englishPart.includes('water') || englishPart.includes('fire') || englishPart.includes('earth') || englishPart.includes('sun')) {
      semanticCategory = 'nature';
    } else if (partOfSpeech === 'v') {
      semanticCategory = 'actions';
    }

    // Determine difficulty level
    let difficultyLevel = 'beginner';
    if (partOfSpeech === 'v' || semanticCategory === 'body_parts') {
      difficultyLevel = 'intermediate';
    } else if (englishPart.includes('complex') || kushiWord.length > 8) {
      difficultyLevel = 'advanced';
    }

    return {
      goji_word: kushiWord,
      part_of_speech: partOfSpeech,
      english_translation: englishPart,
      hausa_translation: hausaPart || undefined,
      semantic_category: semanticCategory,
      difficulty_level: difficultyLevel,
      tone_marking: kushiWord.includes('ʔ') || kushiWord.includes('́') || kushiWord.includes('̀') ? kushiWord : undefined,
      pronunciation_guide: `Tone: ${kushiWord.includes('́') ? 'high' : kushiWord.includes('̀') ? 'low' : 'neutral'}`,
    };
  } catch (error) {
    console.error('Error parsing line:', line, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting Kushi wordlist import...');

    // First, clear existing demo data
    const { error: clearError } = await supabaseClient.rpc('clear_demo_entries');
    if (clearError) {
      console.error('Error clearing demo entries:', clearError);
    } else {
      console.log('Cleared existing demo entries');
    }

    // Parse the wordlist data
    const lines = KUSHI_WORDLIST_DATA.trim().split('\n');
    const entries: KushiEntry[] = [];

    for (const line of lines) {
      const entry = parseKushiEntry(line);
      if (entry) {
        entries.push(entry);
      }
    }

    console.log(`Parsed ${entries.length} entries from wordlist`);

    // Skip creating contribution for system import - insert entries directly

    // Batch insert entries
    const batchSize = 50;
    let insertedCount = 0;
    let errors = [];

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const entriesToInsert = batch.map(entry => ({
        goji_word: entry.goji_word,
        english_translation: entry.english_translation,
        hausa_translation: entry.hausa_translation,
        part_of_speech: entry.part_of_speech,
        semantic_category: entry.semantic_category,
        difficulty_level: entry.difficulty_level,
        tone_marking: entry.tone_marking,
        pronunciation_guide: entry.pronunciation_guide,
        example_sentence: entry.example_sentence,
        cultural_context: entry.cultural_context,
        literal_translation: entry.literal_translation,
        contributor_id: null, // System import
        contribution_id: null, // No contribution needed for system import
        usage_frequency: Math.floor(Math.random() * 10) + 1, // Random frequency for now
      }));

      const { data, error } = await supabaseClient
        .from('dictionary_entries')
        .insert(entriesToInsert)
        .select('id');

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors.push(error);
      } else {
        insertedCount += data?.length || 0;
        console.log(`Inserted batch ${i / batchSize + 1}: ${data?.length} entries`);
      }
    }

    console.log(`Import completed. Inserted ${insertedCount} entries with ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kushi wordlist import completed',
        stats: {
          total_parsed: entries.length,
          total_inserted: insertedCount,
          errors: errors.length,
        },
        sample_entries: entries.slice(0, 5), // Return first 5 as sample
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in import-kushi-wordlist function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Import failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});