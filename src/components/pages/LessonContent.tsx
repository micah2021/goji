import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LessonContentProps {
  lessonId: string;
  onBack: () => void;
}

const LessonContent = ({ lessonId, onBack }: LessonContentProps) => {
  const getLessonContent = (id: string) => {
    switch (id) {
      case "0":
        return {
          title: "Traditions & Culture of Goji",
          titleHa: "Al'adun da al'adun Goji",
          content: `fio̱gho̱ yee Goji weyan kuju ti tom Shelate

Ɗiyo Goji ye ɗi ti shi shelaye, shelayee yuwaro woo marƙu Goji, mma ɗiyee, ɗi lo̱ng ku nwen. Ɗi lo̱ng kuunei gei riya shegkuju ƙan nwang. Gei ma illina, shelayen yooro woo marƙu Goji, yee Goji ma ammoju shi shelaye, wa ɗen jun, nwang ma amna aɗei ko̱gho̱ yee po̱ yun ammobim. O̱o̱ Gojin shiru shigju, ɗe piriṉ ne an gei ta pirinnum awashigim kame fiauri, kame fio̱mmo, kame Dirang, kame Gomle.

Goji, yuuwa karak kan Janga, Gojin ya karak kan Gwandum, karak yee Goji yuwa. Ɗiyee, tibine gei ye yuwa kan nwang insha buƙye. Burak peru tebi shela in minin buk. Powero̱ peru ta bi shela, in minin buk. O̱o̱ ɓoi Gojin galkuju, yoju niye ɗo̱ƙ ta shini, nee ma illina. me fiauri taya shejum, me fio̱mmo taya shejum, me dirang taya shejum, me Gomle taya shejum, In galkuju in ne an gei ju. Fottunboi, te ƙo̱gho̱ ye yikkabi in wa kuju titom shela te.`,
          translation: `The History and Culture of the Goji People

The Goji people are one of the ancient tribes that speak the Goji language, and they have lived in this land for generations. They have inhabited this land and have maintained their cultural practices among the people. For this reason, the cultural practices of the Goji people have been preserved, and they continue to pass down their traditional ways from generation to generation through their ancestral paths.

The Goji people have spread across different areas including Janga, Gwandum, and other Goji settlements. Today, there are different clans that live among the people in various communities. Some live in the mountains and some in the valleys. All of these Goji communities share the same language, customs, and one identity. The Fiauri, Fio̱mmo, Dirang, and Gomle clans all belong to this same heritage. Today, this road continues to bind them together in their shared traditions.`
        };
      case "0.5":
        return {
          title: "Short Stories - The Wisdom of the Elders",
          titleHa: "Gajerun Labarai - Hikimar Masu Girma",
          content: `Ambe ƙan aɗewe

Yuwa manni niyen ambe, pera paara, wa ƙwomi ƙan juƙ, inbe jughi ta shi in shari. ƙo mmere ti malo ta shei inya mere ta shei, va peru, in bena ta shi in shari. Le lo juƙ, le lo va, tiya mmere ta shi, tiya mmere, in peru ta shurmi we shurmi bena.

Yuwa tat tikirai, jo̱lli shi ɗo̱ƙni, in shari ɗin ti ƙuni, in tiya mmere, tiya mmere, in wawe shi golom, in shar shoni tawin ƙi golomiye. Ta sharani, adewe ya paro, ambe le juk tikuno pemo, le lo va, le lo shurmi, golomiye pemo we shigi, pemo leka.

O̱o̱ pemo ɗa woja tere, yoro sheju pemo legha. Ye yamma mina, ti pemo agbemiya? pemo wojoju tere, yoro wo pammonɗo sheju, ye shinta pammonɗei. Pemo, ƙan wo kira gbe, ti kirano pemo, pemo shar le, pemo legha tokkon sheri. O̱o̱ mo ambe ya, we adoni weya shigi, we kirani yiƙƙa, shira wojanim ƙaye, ɗe ƙo̱gho̱ ye shita wojanim. In koni, adewe ya, yamma ma niyo pemo, yamma ra minju we shin po pammo ɗei. O̱o̱ yamma ma niyom, yamma ta minju, ƙo̱gho̱ no yamma gbe. ambe ƙoni, tiya mmereni, tiya mmereni, le juƙ, le va, le shurmi, le golom, in fottu po ɗo̱, wa gal shari ye kuyam tugha, ta she ɗo̱. In peru ta jango̱ni, jangoni waru, wa yiu lo̱`,
          translation: `The Story of the Wise Elder

There once lived an old man who was very wise. When people came to him with problems from their homes and troubles from their work, he would sit with them and listen carefully. Whether they came with sadness or joy, he would work with them and guide them with patience and understanding.

One day, a young person came to him, crying and troubled, sharing their pain and burdens, working through their struggles and seeking comfort and counsel. The elder listened carefully and when he had heard everything, the young person felt lighter, their troubles seemed smaller, and peace began to fill their heart.

But the young person asked many questions: "How do you know these things? What makes you so wise?" The elder smiled and said gently, "My child, I was not always this way. When I was young like you, I had the same struggles you face. Life teaches us through experience, and the road of life guides us all." Finally, the elder said, "God has given me these people to care for, and God has blessed me with understanding so that I may help others." And the young person understood that God loves us all, and that God gives wisdom to those who seek it with a humble heart. The elder continued, "Work with dedication, work with diligence, be humble, be patient, be understanding, be peaceful, and one day you too will help others, guiding them on the same path you once walked." The elder concluded with the wisdom of the leopard: "The leopard's strength lies not in its spots, but in its patient heart."`
        };
      default:
        return {
          title: "Lesson Not Found",
          titleHa: "Ba a sami darasi ba",
          content: "This lesson content is not available yet.",
          translation: "Wannan darasi bai yi ba tukuna."
        };
    }
  };

  const lesson = getLessonContent(lessonId);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back • Komawa
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">{lesson.titleHa}</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Goji Text • Rubutun Goji
              </h3>
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-foreground leading-relaxed whitespace-pre-line font-mono">
                  {lesson.content}
                </p>
              </div>
            </div>

            {lesson.translation && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  English Translation • Fassarar Turanci
                </h3>
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {lesson.translation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LessonContent;