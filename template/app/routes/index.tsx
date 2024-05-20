import { Handler } from "plainweb";
import RootLayout from "~/app/root";

export const GET: Handler = async () => {
  return (
    <RootLayout>
      <div>Let's go!</div>
    </RootLayout>
  );
};
