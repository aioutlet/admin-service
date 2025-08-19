#!/bin/bash

# Admin Service Environment Setup Script
# Supports multiple environments (development, staging, production)

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Set environment (development|staging|production)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e development       Setup for development environment"
    echo "  $0 -e staging          Setup for staging environment"
    echo "  $0 -e production       Setup for production environment"
}

# Parse command line arguments
ENVIRONMENT="development"

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Valid environments: development, staging, production"
        exit 1
        ;;
esac

# Detect OS
detect_os() {
    case "$OSTYPE" in
        linux*)   echo "linux" ;;
        darwin*)  echo "macos" ;;
        msys*)    echo "windows" ;;
        cygwin*)  echo "windows" ;;
        *)        echo "unknown" ;;
    esac
}

# Check Node.js installation
check_nodejs() {
    log_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js $NODE_VERSION is installed"
    else
        log_error "Node.js is not installed. Please install Node.js 18+ to continue"
        exit 1
    fi

    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm $NPM_VERSION is installed"
    else
        log_error "npm is not installed. Please install npm to continue"
        exit 1
    fi
}

# Setup Node.js project
setup_nodejs_project() {
    log_info "Setting up Node.js project..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. This doesn't appear to be a valid Node.js project"
        exit 1
    fi
    
    log_info "Installing npm dependencies..."
    if npm install; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
}

# Load environment variables
load_environment() {
    local env_file=""
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        env_file=".env.development"
    elif [[ "$ENVIRONMENT" == "staging" ]]; then
        env_file=".env.staging"
    elif [[ "$ENVIRONMENT" == "production" ]]; then
        env_file=".env.production"
    else
        env_file=".env"
    fi
    
    if [[ -f "$env_file" ]]; then
        log_info "Loading environment variables from $env_file..."
        set -a  # automatically export all variables
        source "$env_file"
        set +a
        log_success "Environment variables loaded from $env_file"
    else
        log_warning "Environment file $env_file not found, using defaults"
    fi
}

# Setup database (for admin service, no database is needed)
setup_database() {
    log_info "Setting up database for admin-service..."
    
    if [[ -f "database/scripts/seed.js" ]]; then
        log_info "Running database seed script..."
        
        if node database/scripts/seed.js; then
            log_success "Database setup completed"
        else
            log_warning "Database setup completed with warnings"
        fi
    else
        log_warning "No database seed script found"
        log_info "Admin service does not require its own database"
    fi
}

# Main execution
main() {
    echo "Ì∫Ä Setting up admin-service for $ENVIRONMENT environment..."
    echo "=========================================="
    echo "Ìª†Ô∏è  Admin Service Setup"
    echo "=========================================="

    OS=$(detect_os)
    log_info "Detected OS: $OS"
    log_info "Target Environment: $ENVIRONMENT"

    # Setup steps
    check_nodejs
    load_environment
    setup_nodejs_project
    setup_database

    echo "=========================================="
    log_success "‚úÖ Admin Service setup completed!"
    echo "=========================================="
    echo ""
    echo "Ì≥ã Next Steps:"
    echo "  1. Review configuration for $ENVIRONMENT environment"
    echo "  2. Start the service: npm run dev"
    echo "  3. Run tests: npm test"
    echo ""
    echo "Ì≥ç Service Information:"
    echo "  ‚Ä¢ Service: Admin Service"
    echo "  ‚Ä¢ Environment: $ENVIRONMENT"
    echo "  ‚Ä¢ Port: ${PORT:-3010}"
    echo "  ‚Ä¢ Health Check: http://localhost:${PORT:-3010}/health"
    echo ""
    echo "Ì¥ó Service Dependencies:"
    echo "  ‚Ä¢ Auth Service (authentication)"
    echo "  ‚Ä¢ User Service (user management)"
    echo "  ‚Ä¢ Other services (data aggregation)"
}

# Run main function with all arguments
main "$@"
