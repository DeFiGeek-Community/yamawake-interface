import { NextPageContext } from "next";
import Render404 from "ui/components/errors/404";
import Render500 from "ui/components/errors/500";

function CustomError({
  statusCode,
  err,
}: {
  statusCode: number;
  err?: Error & {
    statusCode?: number;
  };
}) {
  if (statusCode === 404) {
    return <Render404 />;
  } else if (err) {
    return <Render500 error={err} />;
  } else {
    const error = new Error("Something went wrong...");
    return <Render500 error={error} />;
  }
}

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, err };
};

export default CustomError;
