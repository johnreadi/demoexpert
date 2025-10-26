

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import type { BlogPost } from '../types';

const BlogPostCard: React.FC<BlogPost> = ({ id, title, summary, image }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold font-heading text-expert-blue mb-2 group-hover:text-expert-green transition-colors">{title}</h3>
            <p className="text-gray-600 mb-4 flex-grow">{summary}</p>
            <div className="mt-auto">
                {/* In a real app, this would link to /blog/${id} */}
                <Link to="#" className="font-bold text-expert-green hover:text-green-700">
                    Lire la suite <i className="fas fa-arrow-right ml-1"></i>
                </Link>
            </div>
        </div>
    </div>
);

export default function BlogPage(): React.ReactNode {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const blogPosts = await api.getBlogPosts();
                setPosts(blogPosts);
            } catch (error) {
                console.error("Failed to fetch blog posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold font-heading text-expert-blue">Notre Blog</h1>
                <p className="text-lg mt-2">Conseils, actualités et astuces de nos experts en recyclage automobile.</p>
            </header>
            {isLoading ? (
                <div className="text-center">Chargement des articles...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => <BlogPostCard key={post.id} {...post} />)}
                </div>
            )}
        </div>
    );
}
