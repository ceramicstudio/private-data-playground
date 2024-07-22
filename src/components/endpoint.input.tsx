import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EndpointInput(props: {
  endpoint: string;
  displayEndpoint: boolean;
  setEndpoint: (value: string) => void;
}) {
  if (!props.displayEndpoint) {
    return <></>;
  }
  return (
    <div className="relative mx-auto w-full max-w-4xl pt-4 text-center">
      <div className="mt-10 flex flex-row items-center justify-center space-x-4">
        <Card key={"key"} className="w-1/3 self-start">
          <CardHeader></CardHeader>
          <CardContent>
            <CardTitle>C1 Endpoint</CardTitle>
            <input
              className="mt-4 text-center"
              value={props.endpoint}
              onChange={(e) => {
                props.setEndpoint(e.target.value);
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
        <div className="absolute left-24 top-24 h-56 w-56 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
        <div className="absolute bottom-2 right-1/4 hidden h-56 w-56 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
        <div className="absolute bottom-1/4 left-1/3 hidden h-56 w-56 animate-blob rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
      </div>
    </div>
  );
}
