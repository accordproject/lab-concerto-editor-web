import PropertySheet from "./PropertySheet";
import PropertyTree from "./PropertyTree";

function FormHost() {
  return (
    <div className="columns">
      <div className="column is-one-quarter">
      <PropertyTree/>
      </div>
      <div className="column">
      <PropertySheet/>
      </div>
    </div>
  );
}

export default FormHost;
