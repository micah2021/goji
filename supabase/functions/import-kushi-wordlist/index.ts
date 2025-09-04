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
ʔàn gèy	n. enemy. abokin gaba.
ʔàn kə̀nímmà	n. rainmaker.
ʔàn kpáanì	n. tanner. majemi.
ʔàn kùwà	n. blacksmith. maƙeri.
ʔàn láddò	n. weaver. masaƙi.
ʔàn páawà	n. butcher. mahauci.
ʔàn shìráw	n. peasant. manomi.
ʔàn shɔ̀ɔ	n. sorcerer. maye.
ʔàn shɔ̀r	n. dancer. mai rawa.
ʔàn tà shwè	n. hunter. mafarauci.
ʔàn tòom	n. warrior. gwarzo, jarumi.
ʔàn tùɣ nìnyò	n. murderer. mai kisan kai.
ʔàn vònàk	n. singer. mawafi i.
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
bèe	v. shoot. harba.
bànà	n. antelope. mazo, ragon ruwa, gwanki.
bàrà	n. trap. tarko.
bèndè	n. penis sheath. gidan azzakari.
bì	1. n. back. baya. 2. prep. behind. (a) baya(n).
bì bìró	n. bark of tree. ɓawo.
bì gbɔ́ŋ	n. nape (of neck). ƙeya.
bì shò	n. footprint. sawun ƙafa.
bìirìm	n. heel. diddige.
bìlìr	n. flower. fure.
bìndìgà	n. gun. bindiga.
bìnnò	n. guest, stranger. baƙo.
bìró	n. tree with no leaves. itace.
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
ɓɔ̀rɔ̀n	type of millet. irin gero.
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
dùwò	n. grave. kabari.
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