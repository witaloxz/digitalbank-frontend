import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/service/account.service";
import { toast } from "sonner";

export const useAccount = (userId?: string) => {
  return useQuery({
    queryKey: ["account", userId],
    queryFn: () => accountService.getCurrentUserAccount(userId!).then(res => res.data),
    enabled: !!userId,
  });
};

export const useAccountStatement = (accountId?: string) => {
  return useQuery({
    queryKey: ["statement", accountId],
    queryFn: () => accountService.getAccountStatement(accountId!).then(res => res.data),
    enabled: !!accountId,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ accountId, amount, description }: { accountId: string; amount: number; description?: string }) => 
      accountService.deposit(accountId, amount, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["statement"] });
      toast.success("Depósito realizado com sucesso!");
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ accountId, amount, description }: { accountId: string; amount: number; description?: string }) => 
      accountService.withdraw(accountId, amount, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["statement"] });
      toast.success("Saque realizado com sucesso!");
    },
  });
};