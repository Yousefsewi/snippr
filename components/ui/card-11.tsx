'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheckIcon, BookmarkIcon, EllipsisIcon,
  HeartIcon, MessageCircleIcon, SendIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Profile = { fallback: string; handle: string; imageAlt: string; imageSrc: string; name: string };
type PostStat = { icon: LucideIcon; label: string };
type SocialPost = { body: string; likes: string; hashtags: readonly string[]; imageAlt: string; imageSrc: string; location: string };

const profile: Profile = {
  fallback: 'SB',
  handle: '@snippr.barber',
  imageAlt: 'Barber profile',
  imageSrc: 'https://i.pravatar.cc/160?img=12',
  name: 'Marco Barbershop',
};

const post: SocialPost = {
  body: 'Just hit 200 bookings this month through Snippr. The dashboard makes managing everything effortless — I can focus on what I love: cutting hair.',
  likes: '1,847 likes',
  hashtags: ['#Snippr', '#BarberLife', '#OnlineBooking'],
  imageAlt: 'Barber at work',
  imageSrc: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
  location: 'Istanbul, Turkey',
};

const stats: readonly PostStat[] = [
  { icon: HeartIcon, label: 'Like' },
  { icon: MessageCircleIcon, label: 'Comment' },
  { icon: SendIcon, label: 'Share' },
] as const;

const Card11 = () => {
  const [liked, setLiked] = useState<boolean>(true);

  return (
    <Card className="border-border/70 bg-background max-w-md overflow-hidden rounded-xl shadow-sm">
      <CardHeader className="flex items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={profile.imageSrc} alt={profile.imageAlt} />
            <AvatarFallback className="text-xs">{profile.fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <CardTitle className="flex items-center gap-1 text-sm">
              {profile.name}
              <BadgeCheckIcon className="size-4 fill-sky-600 stroke-white dark:fill-sky-400" />
            </CardTitle>
            <span className="text-muted-foreground text-xs">{post.location}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Toggle menu" className="size-8 rounded-full">
          <EllipsisIcon className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 px-0 text-sm">
        <img src={post.imageSrc} alt={post.imageAlt} className="aspect-square w-full object-cover" />
        <div className="space-y-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const isLike = stat.label === 'Like';
                return (
                  <Button
                    key={stat.label}
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full"
                    onClick={isLike ? () => setLiked((c) => !c) : undefined}
                  >
                    <Icon className={cn('size-5', isLike && liked && 'fill-destructive stroke-destructive')} />
                    <span className="sr-only">{stat.label}</span>
                  </Button>
                );
              })}
            </div>
            <Button variant="ghost" size="icon" className="size-9 rounded-full">
              <BookmarkIcon className="size-5" />
              <span className="sr-only">Save</span>
            </Button>
          </div>
          <div className="space-y-1.5">
            <p className="text-foreground text-sm font-semibold">{post.likes}</p>
            <p className="text-foreground/90 leading-6">
              <span className="mr-1 font-semibold">{profile.handle}</span>
              {post.body}{' '}
              {post.hashtags.map((tag) => (
                <a key={tag} href="#" className="text-sky-600 dark:text-sky-400">{tag} </a>
              ))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Card11;
