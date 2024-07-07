import { SUBPAGE, type UseSubpage } from "@/use-subpage";
import { Button } from "@/components/ui/button";

export function TopMenu(props: { set: UseSubpage["set"] }) {
  return (
    <div className="mt-4 flex w-screen flex-row items-center justify-center gap-4 p-4">
      <Button
        variant="outline"
        className="ml-4 mr-4 text-xs"
        onClick={() => {
          props.set(SUBPAGE.WRITE);
        }}
      >
        Write
      </Button>
      <Button
        className="text-xs"
        variant="outline"
        onClick={() => {
          props.set(SUBPAGE.READ);
        }}
      >
        Read
      </Button>
    </div>
  );
}
