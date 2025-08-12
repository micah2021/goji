import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const PhonologyPage = () => {
  const basicVowels = [
    { goji: "a", example: "ammo", meaning: "to climb", hausa: "hau" },
    { goji: "e", example: "eno", meaning: "to look", hausa: "kallo" },
    { goji: "i", example: "iro", meaning: "grind stone", hausa: "dutse nika" },
    { goji: "o", example: "sho", meaning: "leg", hausa: "kafa" },
    { goji: "u", example: "duro", meaning: "bambarra nut", hausa: "gurjiya" },
  ];

  const specialVowel = [
    { goji: "o̱", example: "lo̱", meaning: "meat", hausa: "nama" },
    { goji: "o̱", example: "sho̱o̱", meaning: "witch", hausa: "maita" },
  ];

  const longVowels = [
    { vowel: "aa", example: "gaalu", meaning: "to gather", hausa: "tarasu" },
    { vowel: "ee", example: "lee", meaning: "to pluck", hausa: "sinka" },
    { vowel: "oo", example: "ɗiyoo", meaning: "sat (long time)", hausa: "zama" },
    { vowel: "uu", example: "yiuu", meaning: "to have", hausa: "karba" },
  ];

  const diphthongs = [
    { combo: "ai", example: "ɓai", meaning: "dog", hausa: "kare" },
    { combo: "au", example: "au", meaning: "to open", hausa: "bude" },
    { combo: "ei", example: "ɗei", meaning: "tomorrow", hausa: "gobe" },
    { combo: "oi", example: "ɓoi", meaning: "today", hausa: "yau" },
  ];

  const consonants = [
    { letter: "b", example: "baghri", meaning: "dove", hausa: "tattabara" },
    { letter: "ɓ", example: "ɓang", meaning: "strong", hausa: "karfi" },
    { letter: "d", example: "dummo̱", meaning: "hoe", hausa: "fatanya" },
    { letter: "ɗ", example: "ɗummo̱", meaning: "to warm", hausa: "duma" },
    { letter: "f", example: "fiya", meaning: "to blow (mouth)", hausa: "hura" },
    { letter: "g", example: "gei", meaning: "war", hausa: "yaki" },
    { letter: "gb", example: "gbolu", meaning: "to box", hausa: "naushi" },
    { letter: "gh", example: "gagha", meaning: "old woman", hausa: "sohuwa" },
    { letter: "j", example: "jango̱ni", meaning: "leopard", hausa: "damisa" },
    { letter: "k", example: "kalatau", meaning: "church members", hausa: "ikilisiya" },
    { letter: "ƙ", example: "ƙo̱mmo", meaning: "ward", hausa: "sunna angwa" },
    { letter: "kp", example: "kpalo", meaning: "to slap", hausa: "mari" },
    { letter: "l", example: "laano", meaning: "my son", hausa: "yarona" },
    { letter: "m", example: "minna", meaning: "house", hausa: "gida" },
    { letter: "n", example: "nano", meaning: "funeral", hausa: "janaiza" },
    { letter: "ng", example: "daarang", meaning: "sun", hausa: "rana" },
    { letter: "nw", example: "nwang", meaning: "tribe", hausa: "yare" },
    { letter: "p", example: "pomina", meaning: "door", hausa: "kofa" },
    { letter: "r", example: "resho", meaning: "fight him", hausa: "dukeshi" },
    { letter: "sh", example: "sheg", meaning: "wicked", hausa: "mugu" },
    { letter: "t", example: "tere", meaning: "moon", hausa: "wata" },
    { letter: "v", example: "viye", meaning: "soup", hausa: "miya" },
    { letter: "w", example: "woɓodiyo", meaning: "chair", hausa: "kujera" },
    { letter: "y", example: "yamma", meaning: "God", hausa: "Allah" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Goji Phonology</h2>
        <p className="text-sm text-muted-foreground">
          Sounds & Writing System • Eleparo yeti ya shor
        </p>
      </div>

      <Tabs defaultValue="vowels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vowels">Vowels</TabsTrigger>
          <TabsTrigger value="consonants">Consonants</TabsTrigger>
          <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
          <TabsTrigger value="tone">Tone</TabsTrigger>
        </TabsList>

        <TabsContent value="vowels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Vowels</CardTitle>
              <CardDescription>
                Five vowels pronounced as in Hausa and English
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {basicVowels.map((vowel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-mono">
                        {vowel.goji}
                      </Badge>
                      <div>
                        <p className="font-medium">{vowel.example}</p>
                        <p className="text-sm text-muted-foreground">
                          "{vowel.meaning}" • {vowel.hausa}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Vowel: o̱</CardTitle>
              <CardDescription>
                An important additional vowel sound marked differently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {specialVowel.map((vowel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-lg font-mono">
                        {vowel.goji}
                      </Badge>
                      <div>
                        <p className="font-medium">{vowel.example}</p>
                        <p className="text-sm text-muted-foreground">
                          "{vowel.meaning}" • {vowel.hausa}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Long Vowels</CardTitle>
              <CardDescription>
                Written as double letters for extended pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {longVowels.map((vowel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-mono">
                        {vowel.vowel}
                      </Badge>
                      <div>
                        <p className="font-medium">{vowel.example}</p>
                        <p className="text-sm text-muted-foreground">
                          "{vowel.meaning}" • {vowel.hausa}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diphthongs</CardTitle>
              <CardDescription>
                Vowel combinations that occur together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {diphthongs.map((diphthong, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-mono">
                        {diphthong.combo}
                      </Badge>
                      <div>
                        <p className="font-medium">{diphthong.example}</p>
                        <p className="text-sm text-muted-foreground">
                          "{diphthong.meaning}" • {diphthong.hausa}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consonants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consonants</CardTitle>
              <CardDescription>
                24 consonant sounds in the Goji language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {consonants.map((consonant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-mono">
                        {consonant.letter}
                      </Badge>
                      <div>
                        <p className="font-medium">{consonant.example}</p>
                        <p className="text-sm text-muted-foreground">
                          "{consonant.meaning}" • {consonant.hausa}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consonant Combinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">With 'w':</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-4 p-2 border rounded">
                    <Badge variant="outline">dw</Badge>
                    <span>dwagra "brief" • gajire</span>
                  </div>
                  <div className="flex items-center gap-4 p-2 border rounded">
                    <Badge variant="outline">gw</Badge>
                    <span>gwang "food" • abinci</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Long 'm' sound:</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-4 p-2 border rounded">
                    <Badge variant="outline">mm</Badge>
                    <span>mmaro "to read" • kirga</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alphabet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposed Goji Alphabet</CardTitle>
              <CardDescription>fio̱gho̱ penwe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3 text-center">
                {['a', 'b', 'ɓ', 'd', 'ɗ', 'e', 'f', 'g', 'gb', 'gh', 'i', 'j', 'k', 'ƙ', 'kp', 'l', 'm', 'n', 'ng', 'nw', 'o', 'o̱', 'p', 'r', 'sh', 't', 'u', 'v', 'w', 'y'].map((letter, index) => (
                  <Badge key={index} variant="outline" className="text-lg font-mono p-2">
                    {letter}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Note: ƙ can alternatively be written as 'q' following Arabic convention
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tone System</CardTitle>
              <CardDescription>
                Three levels of tone: high, mid, and low
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Tone distinguishes meaning:</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <p className="font-mono text-lg">pamma</p>
                    <div className="grid gap-1 text-sm mt-2">
                      <span>"thank you" • na gode (level tone)</span>
                      <span>"to swear" • ransuwa (low-high)</span>
                      <span>"feather" • gashi (high-low)</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <p className="font-mono text-lg">biro</p>
                    <div className="grid gap-1 text-sm mt-2">
                      <span>"tree" • itace (mid-high)</span>
                      <span>"cane, sceptre" • sanda (high-low)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhonologyPage;