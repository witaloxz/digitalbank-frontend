import { useQuery } from "@tanstack/react-query";
import { contactService } from "@/service/contact.service";

export const useRecentContacts = () => {
  return useQuery({
    queryKey: ["contacts", "recent"],
    queryFn: () => contactService.getRecentContacts().then(res => res.data),
  });
};