function Thumbnail({ video }: VideoProps) {
  return <img src={video.thumbnail} alt={video.title} />;
}

export interface VideoProps {
  video: {
    title: string;
    url: string;
    thumbnail: string;
  };
}

export function Video({ video }: VideoProps) {
  return (
    <div>
      <Thumbnail video={video} />
      <a href={video.url}>
        <h3 safe>{video.title}</h3>
      </a>
    </div>
  );
}
