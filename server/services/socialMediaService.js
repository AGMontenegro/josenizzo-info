import axios from 'axios';

class SocialMediaService {
  constructor() {
    this.facebookPageId = process.env.FACEBOOK_PAGE_ID;
    this.facebookAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  }

  /**
   * Publish a post to Facebook Page
   * @param {Object} article - The article to publish
   * @param {string} article.title - Article title
   * @param {string} article.excerpt - Article excerpt/summary
   * @param {string} article.id - Article ID for URL
   * @param {string} article.image - Article image URL
   * @returns {Promise<Object>} - Facebook API response
   */
  async postToFacebook(article) {
    if (!this.facebookPageId || !this.facebookAccessToken) {
      console.log('Facebook credentials not configured, skipping...');
      return { success: false, error: 'Facebook not configured' };
    }

    try {
      const siteUrl = process.env.SITE_URL || 'https://josenizzo.info';
      const articleUrl = `${siteUrl}/articulo/${article.id}`;

      // Create the post message
      const message = `${article.title}\n\n${article.excerpt || ''}\n\nLee la nota completa:`;

      // Post with link to Facebook Page
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.facebookPageId}/feed`,
        {
          message: message,
          link: articleUrl,
          access_token: this.facebookAccessToken
        }
      );

      console.log('Facebook post published successfully:', response.data.id);
      return {
        success: true,
        postId: response.data.id,
        platform: 'facebook'
      };
    } catch (error) {
      console.error('Error posting to Facebook:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        platform: 'facebook'
      };
    }
  }

  /**
   * Publish to all configured social media platforms
   * @param {Object} article - The article to publish
   * @returns {Promise<Object>} - Results from all platforms
   */
  async publishToAll(article) {
    const results = {
      facebook: null,
      twitter: null,
      instagram: null
    };

    // Facebook
    results.facebook = await this.postToFacebook(article);

    // Twitter/X - TODO: Implement when credentials are available
    // results.twitter = await this.postToTwitter(article);

    // Instagram - TODO: Implement when business account is linked
    // results.instagram = await this.postToInstagram(article);

    return results;
  }
}

export default new SocialMediaService();
