import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/users/users.entity';
import { PostImage } from './post_images.entity';
import { Like } from 'src/interactions/likes.entity';
import { Comment } from 'src/interactions/comments.entity';

export enum PostCategory {
  ADOPT = 'adopt',
  FREE = 'free',
  WALKING = 'walk',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: PostCategory })
  category: PostCategory;

  @Column({ type: 'text' })
  content: string;

  @Column()
  main_image_url: string;

  @Column({ default: 0 })
  views: number;

  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  images: PostImage[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @Column({ default: 0 })
  like_count: number;

  @Column({ default: 0 })
  comment_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
