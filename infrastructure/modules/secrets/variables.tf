variable "name_prefix" {
  description = "Prefix for secret names (e.g. lenslore-dev)."
  type        = string
}

variable "anthropic_api_key" {
  description = "Anthropic API key. Empty string skips initial population — set via console or aws CLI later."
  type        = string
  sensitive   = true
}
