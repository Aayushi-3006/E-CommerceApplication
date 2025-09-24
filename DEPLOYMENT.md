# Deployment Guide for ShopHub

## GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `shopHub` (or any name you prefer)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README (we already have files)

### Step 2: Upload Files to GitHub

#### Option A: Using Git Command Line

```bash
# Navigate to your project directory
cd E-CommerceApplication/Ecommerce-Application

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: ShopHub e-commerce application"

# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

#### Option B: Using GitHub Desktop

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Clone your repository
3. Copy all project files to the cloned folder
4. Commit and push changes

#### Option C: Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click "uploading an existing file"
3. Drag and drop all project files
4. Commit changes

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

### Step 4: Access Your Live Site

- Your site will be available at: `https://YOUR_USERNAME.github.io/REPO_NAME`
- GitHub will show you the exact URL in the Pages settings
- It may take a few minutes for the site to go live

## Custom Domain (Optional)

If you have a custom domain:

1. Create a file named `CNAME` in your repository root
2. Add your domain name (e.g., `mysite.com`)
3. Configure DNS settings with your domain provider
4. Update the custom domain in GitHub Pages settings

## File Structure for GitHub Pages

Make sure your repository has this structure:

```
shopHub/
├── index.html
├── login.html
├── signup.html
├── styles.css
├── app.js
├── auth.js
├── email-service.js
├── README.md
├── .gitignore
└── DEPLOYMENT.md
```

## Troubleshooting

### Site Not Loading
- Check if all files are uploaded correctly
- Verify the repository is public
- Wait a few minutes for GitHub to process

### 404 Error
- Make sure `index.html` is in the root directory
- Check file names (case-sensitive)

### Authentication Issues
- Verify `auth.js` is properly loaded
- Check browser console for errors

## Updates and Maintenance

To update your live site:

1. Make changes to your local files
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Update description"
git push origin main
```
3. GitHub Pages will automatically update (may take a few minutes)

## Performance Tips

1. **Optimize Images**: Compress images before uploading
2. **Minify CSS/JS**: Use online tools to minify files
3. **Enable Caching**: GitHub Pages handles this automatically
4. **Use HTTPS**: GitHub Pages provides free SSL certificates

## Security Notes

- This is a client-side application
- No server-side validation
- Suitable for demo/portfolio purposes
- For production, implement proper backend security

## Support

If you encounter issues:
1. Check GitHub Pages documentation
2. Verify all files are properly uploaded
3. Check browser console for errors
4. Ensure repository is public
