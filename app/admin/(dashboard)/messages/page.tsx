import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { MessagesList } from "./messages-list";

export default async function MessagesAdminPage() {
  const session = await verifySession();
  const messages = await prisma.contactMessage.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Messages"
        description="Submissions from the public contact form."
      />
      <MessagesList messages={messages} />
    </div>
  );
}
