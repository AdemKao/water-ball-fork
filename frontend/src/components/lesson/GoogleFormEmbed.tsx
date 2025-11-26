interface GoogleFormEmbedProps {
  formUrl: string;
}

export function GoogleFormEmbed({ formUrl }: GoogleFormEmbedProps) {
  const embedUrl = formUrl.includes('viewform') 
    ? formUrl.replace('viewform', 'viewform?embedded=true')
    : formUrl;

  return (
    <div className="w-full min-h-[600px] rounded-lg overflow-hidden border">
      <iframe
        src={embedUrl}
        className="w-full h-[600px]"
        frameBorder="0"
      >
        Loading...
      </iframe>
    </div>
  );
}
