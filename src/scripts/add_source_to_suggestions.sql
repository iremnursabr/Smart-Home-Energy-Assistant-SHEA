-- Add source column to suggestions table
ALTER TABLE `suggestions` 
ADD COLUMN `source` VARCHAR(20) NOT NULL DEFAULT 'system' 
COMMENT 'Source of the suggestion - system or ai';

-- Update existing records to have source as 'system'
UPDATE `suggestions` SET `source` = 'system' WHERE `source` IS NULL; 