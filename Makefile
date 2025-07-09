# 📊 Benford's Law Analyzer - Makefile
# Using emoji and ASCII colors for better readability

# Colors
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[0;37m
RESET = \033[0m

# Default target
.DEFAULT_GOAL := help

.PHONY: help start dev build deploy clean test validate

help: ## 📋 Show this help message
	@echo "$(CYAN)📊 Benford's Law Analyzer - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'

start: ## 🚀 Start local development server
	@echo "$(GREEN)🚀 Starting local development server...$(RESET)"
	@echo "$(BLUE)📍 Server will be available at: http://localhost:8000$(RESET)"
	@python3 -m http.server 8000

dev: start ## 🔧 Alias for start command

build: ## 🏗️  Build project (static site - no build needed)
	@echo "$(GREEN)🏗️  Building project...$(RESET)"
	@echo "$(BLUE)✅ Static site - no build process required$(RESET)"
	@echo "$(YELLOW)📁 All files are ready for deployment$(RESET)"

validate: ## ✅ Validate HTML and check for issues
	@echo "$(GREEN)✅ Validating project files...$(RESET)"
	@if command -v html5validator >/dev/null 2>&1; then \
		echo "$(BLUE)🔍 Running HTML validation...$(RESET)"; \
		html5validator --root . --also-check-css; \
	else \
		echo "$(YELLOW)⚠️  html5validator not installed. Install with: pip install html5validator$(RESET)"; \
	fi
	@echo "$(BLUE)📊 Checking file sizes...$(RESET)"
	@ls -lh *.html *.css *.js | awk '{print "$(CYAN)" $$9 "$(RESET): " $$5}'

test: ## 🧪 Run basic tests
	@echo "$(GREEN)🧪 Running basic tests...$(RESET)"
	@echo "$(BLUE)📁 Checking required files...$(RESET)"
	@for file in index.html styles.css script.js package.json netlify.toml README.md; do \
		if [ -f "$$file" ]; then \
			echo "$(GREEN)✅ $$file exists$(RESET)"; \
		else \
			echo "$(RED)❌ $$file missing$(RESET)"; \
		fi \
	done
	@echo "$(BLUE)🔍 Checking JavaScript syntax...$(RESET)"
	@if command -v node >/dev/null 2>&1; then \
		node -c script.js && echo "$(GREEN)✅ JavaScript syntax OK$(RESET)" || echo "$(RED)❌ JavaScript syntax error$(RESET)"; \
	else \
		echo "$(YELLOW)⚠️  Node.js not available for syntax checking$(RESET)"; \
	fi

deploy: build ## 🚀 Deploy to Netlify (requires netlify-cli)
	@echo "$(GREEN)🚀 Deploying to Netlify...$(RESET)"
	@if command -v netlify >/dev/null 2>&1; then \
		echo "$(BLUE)📤 Running Netlify deployment...$(RESET)"; \
		netlify deploy --prod --dir=.; \
	else \
		echo "$(YELLOW)⚠️  Netlify CLI not installed.$(RESET)"; \
		echo "$(CYAN)📖 Install with: npm install -g netlify-cli$(RESET)"; \
		echo "$(CYAN)🔗 Or deploy manually at: https://app.netlify.com/drop$(RESET)"; \
	fi

clean: ## 🧹 Clean temporary files
	@echo "$(GREEN)🧹 Cleaning temporary files...$(RESET)"
	@find . -name ".DS_Store" -delete 2>/dev/null || true
	@find . -name "*.tmp" -delete 2>/dev/null || true
	@find . -name "*.log" -delete 2>/dev/null || true
	@echo "$(BLUE)✅ Cleanup complete$(RESET)"

install: ## 📦 Install development dependencies
	@echo "$(GREEN)📦 Installing development dependencies...$(RESET)"
	@if command -v npm >/dev/null 2>&1; then \
		echo "$(BLUE)📥 Installing Netlify CLI...$(RESET)"; \
		npm install -g netlify-cli; \
	else \
		echo "$(YELLOW)⚠️  npm not available$(RESET)"; \
	fi
	@if command -v pip3 >/dev/null 2>&1; then \
		echo "$(BLUE)📥 Installing HTML validator...$(RESET)"; \
		pip3 install html5validator; \
	else \
		echo "$(YELLOW)⚠️  pip3 not available$(RESET)"; \
	fi

info: ## ℹ️  Show project information
	@echo "$(CYAN)📊 Benford's Law Analyzer - Project Info$(RESET)"
	@echo ""
	@echo "$(YELLOW)📁 Project Structure:$(RESET)"
	@tree -I 'node_modules|.git' . 2>/dev/null || ls -la
	@echo ""
	@echo "$(YELLOW)🔧 Technology Stack:$(RESET)"
	@echo "$(BLUE)  • Frontend: HTML5, CSS3 (Tailwind), Vanilla JavaScript$(RESET)"
	@echo "$(BLUE)  • Visualization: Chart.js$(RESET)"
	@echo "$(BLUE)  • Deployment: Netlify$(RESET)"
	@echo ""
	@echo "$(YELLOW)🌐 URLs:$(RESET)"
	@echo "$(BLUE)  • Local: http://localhost:8000$(RESET)"
	@echo "$(BLUE)  • Netlify: https://app.netlify.com/drop$(RESET)"

demo: ## 🎯 Open demo with sample data
	@echo "$(GREEN)🎯 Starting demo...$(RESET)"
	@echo "$(BLUE)📊 Opening browser with sample data$(RESET)"
	@python3 -m http.server 8000 &
	@sleep 2
	@open http://localhost:8000 2>/dev/null || echo "$(YELLOW)🌐 Open http://localhost:8000 in your browser$(RESET)"
