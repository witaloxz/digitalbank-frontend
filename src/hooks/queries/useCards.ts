import { useQuery } from "@tanstack/react-query";
import { cardService } from "@/service/card.service";

export const useCards = () => {
  return useQuery({
    queryKey: ["cards"],
    queryFn: () => cardService.getMyCards().then(res => res.data),
  });
};