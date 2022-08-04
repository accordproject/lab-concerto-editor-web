function TypeReference({ name, namespace }: { name: string; namespace?: string }) {
  return (
    <span>
      {namespace} {name}
    </span>
  );
}

export default TypeReference;
