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